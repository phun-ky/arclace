export { Arclace, createConnections } from './Arclace';

export {
  Connection,
  DEFAULT_CONNECTION_OPTIONS,
  type ArcConnectionParamsType,
  type ArcOptionalKeysType,
  type ArcResolvedConnectionOptionsType
} from './Connection';

export type {
  ArcArrowType,
  ArcConnectionDefinitionType,
  ArcConnectionOptionsType,
  ArcElementTargetType,
  ArcGeometryType,
  ArcOptionsType,
  ArcPathType,
  ArcPointInterface,
  ArcRectInterface,
  ArcSideOptionType,
  ArcSideType
} from './types';

export {
  bezierPath,
  orthogonalPath,
  straightPath,
  type ArcPathResultType
} from './utils/paths';
