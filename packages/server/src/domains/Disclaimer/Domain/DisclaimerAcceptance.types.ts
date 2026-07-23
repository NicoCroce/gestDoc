export interface IDisclaimerAcceptance {
  id_usuario: number;
  id_empresa: number;
  hash_prueba: string;
  ip: string;
  user_agent: string | null;
  timestamp: Date | string;
  id?: number;
}
