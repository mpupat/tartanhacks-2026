import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Outlet />
    </div>
  );
};
