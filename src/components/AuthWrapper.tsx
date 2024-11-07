import { useState, useEffect } from "react";
import { Card, Input, Button } from "@mantine/core";

// Move this to .env file
// VITE_AUTH_HASH should be a hashed version of your password
import { ReactNode } from "react";

function AuthWrapper({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user was previously authenticated
    const authStatus = sessionStorage.getItem("auth-status");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const attemptHash = btoa(password);
    const realHash = import.meta.env.VITE_AUTH_HASH;

    if (attemptHash === realHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem("auth-status", "true");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div id="access-form">
        <Card shadow="sm" padding="lg" radius="md" withBorder className="card">
          <h2 className="">Story Ribbons Access</h2>
          <form onSubmit={handleSubmit} className="">
            {error && <div className="error">{error}</div>}
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className=""
                required
              />
            </div>
            <Button type="submit" color="blue" fullWidth mt="md">
              Submit
            </Button>
          </form>
          <p>
            Contact{" "}
            <a href="mailto:catherineyeh@g.harvard.edu" className="">
              catherineyeh@g.harvard.edu
            </a>{" "}
            for access / more information.
          </p>
        </Card>
      </div>
    );
  }

  return children;
}

export default AuthWrapper;
