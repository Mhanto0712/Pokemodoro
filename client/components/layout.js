import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useRouter } from "next/router.js";
import { useState, useEffect } from "react";
import AuthService from "../service/auth.js";
import Head from "next/head";
import Navbar from "./navbar.js";

export default function Layout({
  children,
  currentUser,
  setCurrentUser,
  getReqUser,
  setGetReqUser,
  isLoading,
  setIsLoading,
}) {
  const router = useRouter();
  const currentRoute = router.asPath;
  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index,follow" />
        <meta name="author" content="劉洧瑄" />
        <meta
          name="description"
          content="這是一個使用Poke API製作的番茄鐘網頁"
        />
        <title>Pokemodoro</title>
        <link rel="icon" href="/Pokemodoro.png" />
      </Head>
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        getReqUser={getReqUser}
        setGetReqUser={setGetReqUser}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {children}
      <section
        className={
          currentRoute === "/" || "/signup" || "/signup"
            ? "backgroundIndexSignupSignin"
            : ""
        }
      ></section>
    </div>
  );
}
