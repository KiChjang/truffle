const Deployed = require("./deployed");
const path = require("path");
const fse = require("fs-extra");
const contract = require("@truffle/contract");
const find_contracts = require("@truffle/contract-sources");

function TestSource(config) {
  this.config = config;
}

TestSource.prototype.require = function() {
  return null; // FSSource will get it.
};

TestSource.prototype.resolve = async function(importPath) {
  const self = this;

  if (importPath === "truffle/DeployedAddresses.sol") {
    const sourceFiles = await find_contracts(this.config.contracts_directory);

    let abstractionFiles;
    const buildDirFiles = (abstractionFiles = fse.readdirSync(
      self.config.contracts_build_directory
    ));
    abstractionFiles = buildDirFiles.filter(file => file.match(/^.*.json$/));

    const mapping = {};

    const blacklist = new Set(["Assert", "DeployedAddresses"]);

    // Ensure we have a mapping for source files and abstraction files
    // to prevent any compile errors in tests.
    sourceFiles.forEach(file => {
      const name = path.basename(file, ".sol");
      if (blacklist.has(name)) return;
      mapping[name] = false;
    });

    abstractionFiles.forEach(file => {
      const name = path.basename(file, ".json");
      if (blacklist.has(name)) return;
      mapping[name] = false;
    });

    const filesData = abstractionFiles.map(file => {
      return fse.readFileSync(
        path.join(self.config.contracts_build_directory, file),
        "utf8"
      );
    });

    const addresses = filesData
      .map(data => JSON.parse(data))
      .map(json => contract(json))
      .map(c => {
        c.setNetwork(self.config.network_id);
        if (c.isDeployed()) return c.address;
        return null;
      });

    addresses.forEach((address, i) => {
      const name = path.basename(abstractionFiles[i], ".json");

      if (blacklist.has(name)) return;

      mapping[name] = address;
    });

    const addressSource = Deployed.makeSolidityDeployedAddressesLibrary(
      mapping,
      self.config.compilers
    );
    return { body: addressSource, resolvedPath: importPath };
  }
  const assertLibraries = [
    "Assert",
    "AssertAddress",
    "AssertAddressArray",
    //      "AssertAddressPayableArray", only compatible w/ ^0.5.0
    "AssertBalance",
    "AssertBool",
    "AssertBytes32",
    "AssertBytes32Array",
    "AssertGeneral",
    "AssertInt",
    "AssertIntArray",
    "AssertString",
    "AssertUint",
    "AssertUintArray"
  ];

  for (const lib of assertLibraries) {
    if (importPath === `truffle/${lib}.sol`) {
      const body = fse.readFileSync(
        path.resolve(path.join(__dirname, `${lib}.sol`)),
        { encoding: "utf8" }
      );
      return { body, resolvedPath: importPath };
    }
  }
};

TestSource.prototype.resolve_dependency_path = (importPath, dependencyPath) => {
  return dependencyPath;
};

module.exports = TestSource;
