import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import style from "../styles/about.module.scss";
import "aos/dist/aos.css";

export default function About({
  currentUser,
  getReqUser,
  setGetReqUser,
  isLoading,
  setIsLoading,
}) {
  let router = useRouter();
  useEffect(() => {
    if (currentUser) {
      if (!getReqUser.data.username) {
        alert("為自己取個訓練家暱稱吧！");
        router.push("/editusername");
      }
    }
  }, [getReqUser]);
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const images = [
    "/about/關於1 edit.png",
    "/about/關於2.png",
    "/about/關於3.png",
    "/about/關於4.png",
    "/about/關於5.png",
  ];

  const variants = {
    initial: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        // scale: 0.5,
      };
    },
    animate: {
      x: 0,
      opacity: 1,
      // scale: 1,
      // transition: 'ease-in',
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 1 },
      },
    },
    exit: (direction) => {
      return {
        x: direction > 0 ? -1000 : 1000,
        opacity: 0,
        // scale: 0.5,
        // transition: 'ease-in',
        transition: {
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 1 },
        },
      };
    },
  };

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  function nextStep() {
    setDirection(1);
    if (index === images.length - 1) {
      setIndex(0);
      return;
    }
    setIndex(index + 1);
  }

  function prevStep() {
    setDirection(-1);
    if (index === 0) {
      setIndex(images.length - 1);
      return;
    }
    setIndex(index - 1);
  }

  return (
    <div className={style.container}>
      <div className={style.slideshow}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            variants={variants}
            animate="animate"
            initial="initial"
            exit="exit"
            src={images[index]}
            alt="slides"
            className={style.slides}
            key={images[index]}
            custom={direction}
          />
        </AnimatePresence>
        <button
          className={`${style.prevButton} ${style.button}`}
          onClick={prevStep}
        >
          ◀
        </button>
        <button
          className={`${style.nextButton} ${style.button}`}
          onClick={nextStep}
        >
          ▶
        </button>
      </div>
      <a href="mailto:mhanto0712@gmail.com" className={style.contact}>
        聯絡信箱：mhanto0712@gmail.com
      </a>
    </div>
  );
}
