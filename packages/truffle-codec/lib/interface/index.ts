export { getStorageAllocations, storageSize } from "../allocate/storage";
export { getAbiAllocations, getCalldataAllocations, getEventAllocations } from "../allocate/abi";
export { getMemoryAllocations } from "../allocate/memory";
export { readStack } from "../read/stack";
export { slotAddress } from "../read/storage";
export { StoragePointer } from "../types/pointer";
export { ContractAllocationInfo, StorageAllocations, StorageMemberAllocation, AbiAllocations, CalldataAllocations, EventAllocations } from "../types/allocation";
export { Slot, isWordsLength } from "../types/storage";
export { DecoderRequest, isStorageRequest, isCodeRequest } from "../types/request";
export { EvmInfo } from "../types/evm";
export { CalldataDecoding, EventDecoding } from "../types/wire";

export { decodeVariable, decodeEvent, decodeCalldata } from "./decoding";

export { encodeAbi, encodeTupleAbi } from "../encode/abi"; //we have no need to export these at present, but someone might want them?