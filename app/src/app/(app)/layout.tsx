import Navbar from '@/components/Navbar';
import { AlertProvider } from '@/context/AlertProvider';
import ReactQueryProviderWrapper from '@/context/QueryProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <ReactQueryProviderWrapper>
      <AlertProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar /> <main className="mt-16">{children}</main>{' '}
        </div>
      </AlertProvider>
    </ReactQueryProviderWrapper>
  );
}
