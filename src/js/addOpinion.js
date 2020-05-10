/*
 * Createfd by Stefan Korecko, 2020
 * Form processing functionality
 */

function processOpnFrmData(event) {
  //1.prevent normal event (form sending) processing
  event.preventDefault();

  //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
  const nopName = document.getElementById("nameElm").value.trim();
  const nopOpn = document.getElementById("opnElm").value.trim();
  const nopWillReturn = document.getElementById("willReturnElm").checked;

  //3. Verify the data
  if (nopName == "" || nopOpn == "") {
    window.alert("Please, enter both your name and opinion");
    return;
  }

  //3. Add the data to the array opinions and local storage
  const newOpinion = {
    name: nopName,
    comment: nopOpn,
    willReturn: nopWillReturn,
    created: new Date()
  };

  let opinions = [];

  if (localStorage.myTreesComments) {
    opinions = JSON.parse(localStorage.myTreesComments);
  }

  opinions.push(newOpinion);
  localStorage.myTreesComments = JSON.stringify(opinions);

  //5. Go to the opinions
  window.location.hash = "#opinions";
}
