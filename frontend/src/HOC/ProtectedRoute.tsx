import React from "react";
import { Route, Redirect, RouteComponentProps } from "react-router-dom";

interface ProtectedRoute extends Route {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  user: any;
}

const ProtectedRoute: React.FC<ProtectedRoute> = ({
  component: Component,
  user,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (user) return <Component {...rest} {...props} />;
        else
          return (
            <Redirect
              to={{
                pathname: "/signin",
                state: {
                  from: props.location,
                },
              }}
            />
          );
      }}
    />
  );
};

export default ProtectedRoute;
