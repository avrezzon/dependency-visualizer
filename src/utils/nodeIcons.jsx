import { Box, Database, Cpu, Activity } from 'lucide-react';

export const NODE_ICONS = {
  core: <Box className="w-5 h-5 text-blue-500" />,
  repo: <Database className="w-5 h-5 text-emerald-500" />,
  app: <Cpu className="w-5 h-5 text-purple-500" />,
  default: <Activity className="w-5 h-5" />
};
