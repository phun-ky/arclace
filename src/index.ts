export { ConnectTheThings, createConnections } from './ConnectTheThings';

export {
  Connection,
  DEFAULT_CONNECTION_OPTIONS,
  type CTTConnectionParamsType,
  type CTTOptionalKeysType,
  type CTTResolvedConnectionOptionsType
} from './Connection';

export type {
  CTTArrowType,
  CTTConnectionDefinitionType,
  CTTConnectionOptionsType,
  CTTElementTargetType,
  CTTGeometryType,
  CTTOptionsType,
  CTTPathType,
  CTTPointInterface,
  CTTRectInterface,
  CTTSideOptionType,
  CTTSideType
} from './types';

export {
  bezierPath,
  orthogonalPath,
  straightPath,
  type CTTPathResultType
} from './utils/paths';
