import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useRouter } from "next/router.js";
import Router from "next/router";
import Layout from "../components/layout.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import AuthService from "../service/auth.js";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.scss";
import { useState, useEffect } from "react";

export default function MyApp({ Component, pageProps, router }) {
  let [currentUser, setCurrentUser] = useState(null);
  let [getReqUser, setGetReqUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useRouter();
  useEffect(() => {
    AuthService.getCurrentUser().then((data) => {
      setCurrentUser(data);
    });
  }, []);
  useEffect(() => {
    if (currentUser) {
      AuthService.getReqUser(currentUser).then((data) => {
        setGetReqUser(data);
      });
    }
  }, [currentUser, Component]);
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  useEffect(() => {
    const routeEventStart = () => {
      setIsLoading(true);
    };
    const routeEventEnd = () => {
      setIsLoading(false);
    };
    Router.events.on("routeChangeStart", routeEventStart);
    Router.events.on("routeChangeComplete", routeEventEnd);
    Router.events.on("routeChangeError", routeEventEnd);
    return () => {
      Router.events.off("routeChangeStart", routeEventStart);
      Router.events.off("routeChangeComplete", routeEventEnd);
      Router.events.off("routeChangeError", routeEventEnd);
    };
  }, []);
  return (
    <Layout
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      getReqUser={getReqUser}
      setGetReqUser={setGetReqUser}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "0%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            style={{
              position: "absolute",
              zIndex: "-1",
              top: "0",
              left: "0",
              width: "100%",
            }}
          >
            <Component
              {...pageProps}
              key={router.asPath}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              getReqUser={getReqUser}
              setGetReqUser={setGetReqUser}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </Layout>
  );
}
