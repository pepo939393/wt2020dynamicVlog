/*
 * Created by Peter Pekarcik, 2020
 */

function opinion2html(opinion) {
  //TODO finish opinion2html
  const opinionView = {
    name: opinion.name,
    comment: opinion.comment,
    createdDate: new Date(opinion.created).toDateString()
  };

  const template = document.getElementById("mTmplOneOpinion").innerHTML;
  return (htmlWOp = Mustache.render(template, opinionView));
  //DONE
}

//funkcia vygeneruje HTML so vsetkyki nazormi z pola souceData (Pri jej volani ako paramter pouzijeme pole opinions)
function opinionArray2html(sourceData) {
  //TODO finish opinionArray2html
  return sourceData.reduce(
    (htmlWithOpinions, opn) => htmlWithOpinions + opinion2html(opn),
    ""
  );
  //DONE
}

//--------------------------------------------------------------------------------------------------------------
//data and localStorage handling and rendering opinions to the page at startup

let opinions = [];

//TODO Add opinionsElm variable, referencing the div with id="opinionsContainer"
const opinionsElm = document.getElementById("opinionsContainer"); //VLOZIL SI

if (localStorage.myComments) {
  opinions = JSON.parse(localStorage.myComments);
}

//TODO render opinions to html
opinionsElm.innerHTML = opinionArray2html(opinions);
//DONE

//--------------------------------------------------------------------------------------------------------------
//Form processing functionality

/*
 * Note:
 * For the sake of simplicity, here we use window.alert to display messages to the user
 * However, if possible, avoid them in the production versions of your web applications
 *
 */

let commFrmElm = document.getElementById("opinionform");

commFrmElm.addEventListener("submit", processOpnFrmData);

function processOpnFrmData() {
  //1.prevent normal event (form sending) processing
  event.preventDefault();

  //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
  const nameFormElement = document.getElementById("name").value.trim();
  const opinionFormElement = document.getElementById("opinion").value.trim();

  //3. Verify the data
  if (nameFormElement == "" || opinionFormElement == "") {
    window.alert("Please, enter both your name and opinion");
    return;
  }

  //4. Add the data to the array opinions and local storage
  const newOpinion = {
    name: nameFormElement,
    comment: opinionFormElement,
    created: new Date()
  };

  opinions.push(newOpinion);
  localStorage.myComments = JSON.stringify(opinions);

  //5. Update HTML
  //TODO add the new opinion to HTML
  opinionsElm.innerHTML += opinion2html(newOpinion);

  //5. Reset the form
  commFrmElm.reset();
}
