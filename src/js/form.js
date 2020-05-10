//--------------------------------------------------------------------------------------------------------------
//data and localStorage handling at startup

let opinions = [];

//ak su v localStorage komentare tak ich tam vsetky vlozi
if (localStorage.myComments) {
  opinions = JSON.parse(localStorage.myComments);
}

console.log(opinions);

//--------------------------------------------------------------------------------------------------------------
//functions for transforming opinion(s) to Html code

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

//TODO Add opinionsElm variable, referencing the div with id="opinionsContainer"
const opinionsElm = document.getElementById("opinionsContainer"); //VLOZIL SI

if (localStorage.myTreesComments) {
  opinions = JSON.parse(localStorage.myTreesComments);
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

let submitButton = document.getElementById("submit"); //vytiahne element tlacitka
submitButton.addEventListener("click", processOpinionFormData);

function processOpinionFormData(event) {
  event.preventDefault(); //nebude sa refreshovat

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const picture = document.getElementById("picture").value.trim();
  const sex = document.getElementById("form").elements["sex"].value;
  const agree = document.getElementById("agree").value;
  const opinion = document.getElementById("opinion").value.trim();
  const keywords = document.getElementById("keywords").value.trim();

  if (name == "" || opinion == "") {
    window.alert("Please, enter both your name and opinion");
    return;
  }

  const newOpinion = {
    name: name,
    email: email,
    picture: picture,
    sex: sex,
    agree: agree,
    opinion: opinion,
    keywords: keywords,
    created: new Date()
  };

  opinions.push(newOpinion);
  localStorage.myComments = JSON.stringify(opinions);

  opinionsElm.innerHTML += opinion2html(newOpinion);

  //5. Reset the form
  commFrmElm.reset(); //resets the form

  //4. Notify the user
  window.alert("Your opinion has been stored. Look to the console");
  console.log("New opinion added");
  console.log(opinions);
}
