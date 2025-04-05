declare module '@/components/ClientLayout' {
  import { ReactNode } from 'react';
  
  interface ClientLayoutProps {
    children: ReactNode;
  }
  
  const ClientLayout: React.FC<ClientLayoutProps>;
  export default ClientLayout;
} 