import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Send from "./pages/Send";
import Airdrop from "./pages/Airdrop";
import PasskeyAirdrop from "./pages/PasskeyAirdrop";
import Debugger from "./pages/Debugger.tsx";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="KALE Links"
      projectTitle="🥬 KALE Links"
      contentRight={
        <>
          <nav>
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => (window.location.href = "/debug")}
                  disabled={isActive}
                >
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} My App. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/airdrop" element={<Airdrop />} />
        <Route path="/passkey-airdrop" element={<PasskeyAirdrop />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
