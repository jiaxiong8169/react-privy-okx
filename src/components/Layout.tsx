import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  return (
    <div className="flex flex-col w-screen h-screen items-center gap-6">
      {user?.id ? (
        <button onClick={() => logout()}>Logout</button>
      ) : (
        <button onClick={() => login()}>Login</button>
      )}
      <p>User: {user?.wallet?.address}</p>
      <div className="w-[600px]">{children}</div>
    </div>
  );
};
