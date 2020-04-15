 module.exports = (event, timeout, check, bot) => {
   if (!bot) throw new Error("No bot. Idiot.");
   let t;
   // Checks to see if it's a function
   if (!check || typeof check !== "function") check = () => true;
   return new Promise((rs, rj) => {
     const listener = async (...args) => {
       let finalCheck = await check(...args);
       if (check && typeof check == "function" && finalCheck === true) {
         dispose();
         rs([...args]);
       }
     };
     const dispose = () => {
       bot.removeListener(event, listener);
       if (t) clearTimeout(t);
     };
     if (timeout) {
       t = setTimeout(() => {
         dispose();
         rj("timeout");
       }, timeout);
     }
     bot.on(event, listener);
   });
 };
