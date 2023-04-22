//sec to 00:00:00
const todayTrainingConvert = (sec) => {
  const result = new Date(sec * 1000).toISOString().slice(11, 19);
  return result;
};

//id to 0001
const idConvert = (id) => {
  let stringId = id.toString();
  const result = stringId.padStart(4, "0");
  return result;
};

//計時器－每25分鐘，休息5分鐘。第四次循環的休息時間改成30分鐘，暫停即重新！
const pomodoro = () => {
  if (startTraining) {
    workTime = window.setInterval(() => {
      oneWork++;
    }, 1000);
    restTime = window.setInterval(() => {
      if (oneWork >= 4) {
        oneRest++;
      }
    }, 1000);
    showTime = window.setInterval(() => {
      //oneWork
      if (oneWork <= 3) {
        console.log("WORK: " + oneWork);
      } else if (oneWork == 4) {
        window.clearInterval(workTime);
      }
      //oneRest
      if (numberOfRest == 3) {
        if (oneWork == 4 && oneRest <= 3) {
          console.log("REST: " + oneRest);
        } else if (oneRest == 4) {
          numberOfRest++;
          console.log("次數: " + numberOfRest);
          numberOfRest = 0;
          window.clearInterval(showTime, restTime);
          if (numberOfRest == 0) {
            oneWork = 1;
            oneRest = 0;
            console.log("WORK: " + oneWork);
            pomodoro(oneWork, oneRest, numberOfRest, startTraining);
          }
        }
      }

      if (numberOfRest < 3) {
        if (oneWork == 4 && oneRest <= 1) {
          console.log("REST: " + oneRest);
        } else if (oneRest == 2) {
          numberOfRest++;
          console.log("次數: " + numberOfRest);
          window.clearInterval(showTime, restTime);
          if (numberOfRest <= 3) {
            oneWork = 1;
            oneRest = 0;
            console.log("WORK: " + oneWork);
            pomodoro(oneWork, oneRest, numberOfRest, startTraining);
          }
        }
      }
    }, 1000);
  } else {
    window.clearInterval(workTime, restTime, showTime);
  }
};

export { todayTrainingConvert, idConvert };
