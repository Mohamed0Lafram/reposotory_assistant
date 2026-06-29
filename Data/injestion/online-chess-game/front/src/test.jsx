import { useEffect, useRef, useState } from "react";

export default function String() {
  const [title, setTitle] = useState("");
  const string = ["niggaaaaaaaa please",'xhalh please','jew please!!!!!!!!!!!!!!','3war pleaseeeeee'];
  const str_number = useRef(0);
  const index = useRef(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (str_number.current >= string[index.current].length) {
        str_number.current = 0;
        if(index.current < 3){
            index.current++
        }else { index.current = 0}

      } else {
        str_number.current++;

      }

      setTitle(string[index.current].slice(0, str_number.current));
      console.log(string[index.current].slice(0, str_number.current));
    }, 100);

    // cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return <span>{title}</span>;
}
