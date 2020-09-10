import React, { useState, FunctionComponent } from "react";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Hello, Register, Rooms, Game, HUB } from "./pages"
import Layout from './core/layouts/showcase'
import User, { UserProvider } from './core/contexts/userContext'

import "./tailwind.output.css";

type Page = {
  slug: string
  Component: FunctionComponent<any>
  path?: string[]
}

export default function App(): JSX.Element {
  // creating our pages array
  const pages: Page[] = [
    { slug: 'hub', Component: HUB, path: ['/'] },
    { slug: 'hello', Component: Hello },
    { slug: 'register', Component: Register },
    { slug: 'rooms', Component: Rooms },
    { slug: 'games', Component: Game },
  ]

  return (
    <UserProvider {...User}>
      <Router>
        <Layout>
          <Switch>
            {pages.map(({ slug, Component, path }: Page, index: number) => (
              <Route key={index} exact path={path ?? `/${slug}`}>
                <Component />
              </Route>
            ))}
          </Switch>
        </Layout>
      </Router>
    </UserProvider>
  );
}
