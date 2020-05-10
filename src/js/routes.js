const url = "https://wt.kpi.fei.tuke.sk/api/article";   //odkial tahame article
const articlesPerPage = 20;

//an array, defining the routes
export default [

    {
        //the part after '#' in the url (so-called fragment):
        hash: "welcome",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },

    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },

    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions
    },


    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML
    },

    {
        hash: "forum",
        target: "router-view",
        getTemplate: createHtml4Forum
    },

    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },

    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },

    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: insertArticle
    }


];

function createHtml4Forum(targetElm) {
    document.getElementById(targetElm).innerHTML = document.getElementById("template-forum").innerHTML

    /*
 * Created by Peter Pekarcik, 2020
 */

    function opinion2html(opinion) {
        //TODO finish opinion2html
        const opinionView = {
            name: opinion.name,
            comment: opinion.comment,
            createdDate: (new Date(opinion.created)).toDateString()
        };

        const template = document.getElementById("mTmplOneOpinion").innerHTML;
        return Mustache.render(template, opinionView);
        //DONE
    }

//funkcia vygeneruje HTML so vsetkyki nazormi z pola souceData (Pri jej volani ako paramter pouzijeme pole opinions)
    function opinionArray2html(sourceData) {
        //TODO finish opinionArray2html
        return sourceData.reduce((htmlWithOpinions, opn) => htmlWithOpinions + opinion2html(opn), "");
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
    opinionsElm.innerHTML = opinionArray2html(opinions)
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
        const newOpinion =
            {
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
}

function createHtml4opinions(targetElm) {
    const opinionsFromStorage = localStorage.myTreesComments;
    let opinions = [];

    if (opinionsFromStorage) {
        opinions = JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn = opinion.willReturn ? "I will return to this page." : "Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}

function fetchAndDisplayArticles(targetElm, page) {
    console.log(page)
    //tu sa nastavuje pocet, kt bude zobrazeny na zaklade premenenej articlesPerPage
    fetch(url + "/?max=" + articlesPerPage + "&offset=" + page * articlesPerPage)       //navstivi stranku a stiahne jej obsah - 20 pocet
        .then(response => {
            if (response.ok) {                                //ak bola odpovedet zo servra ok
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(articleList => {

            console.log(articleList)

            let article_promises = [];

            for (let article of articleList.articles) {
                article_promises.push(fetch(url + "/" + article.id).then(response => response.json()));
            }

            return Promise.all(article_promises);
        })
        .then(
        articleList => {
            for (let article of articleList) {
                //addArtDetailLink2ResponseJson(article, page);
                article.detailLink = `#article/${article.id}/${page}`;
            }

            console.log(articleList);
            document.getElementById(targetElm).innerHTML =
                Mustache.render(                            //nahradi mustache sablonu podla JSON dat
                    document.getElementById("template-articles").innerHTML,
                    {
                        articleList,
                        page,
                        nextPage: function () {
                            return Number(this.page) + 1;
                        },
                        previousPage: function () {
                            if(Number(this.page) > 0) {
                                return Number(this.page) - 1;
                            }else {
                                return 0;
                            }
                        }
                    }
                )
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}

/**
 * TÃ¡to funkcia vyrobÃ­ potrebnÃ½ url fragment
 */
function addArtDetailLink2ResponseJson(responseJSON, page) {
    responseJSON.articles =
        responseJSON.articles.map(
            article => (
                {
                    ...article, //tento objekt bude mat vsetky vlastnosti articlu + detail link
                    detailLink: `#article/${article.id}/${page}`
                }
            )
        );
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, page) {
    fetchAndProcessArticle(...arguments, false);
}


/**
 * Gets an article record from a server and processes it to html according to the value of the forEdit parameter.
 * Assumes existence of the urlBase global variable with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates with id="template-article" (if forEdit=false)
 * and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
function fetchAndProcessArticle(targetElm, artIdFromHash, page, forEdit) {
    const url_addres = `${url}/${artIdFromHash}`;

    let article_info = [ fetch(url_addres), fetch(url_addres + "/comment")];

    Promise.all(article_info)
        .then(([article_response, comment_response]) => {
            if (article_response.ok && comment_response.ok) {
                return Promise.all([article_response.json(), comment_response.json()]);
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(([articleData, commentData]) => {


            if (forEdit) {
                articleData.formTitle = "Article Edit";
                articleData.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${page},'${url}')`;
                articleData.submitBtTitle = "Save article";
                articleData.url = url_addres;

                //`#article/${article.id}/${page};
                articleData.backLink = `#article/${artIdFromHash}/${page}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        articleData
                    );
            } else {
                console.log(commentData);
                articleData.backLink = `#articles/${page}`;
                articleData.editLink = `#artEdit/${articleData.id}/${page}`;
                articleData.deleteLink = `#artDelete/${articleData.id}/${page}`;
                articleData.comments = commentData.comments;
                articleData.insertCommentCall = "processCommentsFormData(event, " + artIdFromHash + ", '" + url_addres + "')";

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        articleData
                    );
            }

        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}

function editArticle(targetElm, artIdFromHash, page) {
    fetchAndProcessArticle(...arguments, true); //argument - pole vsetkych argumntov,
}

function deleteArticle(targetElem, idArticle, page) {
    const url_addres = `${url}/${idArticle}`;

    fetch(url_addres, {method: "DELETE"})
        .then(
            () => fetchAndDisplayArticles(targetElem, page)
        )
        .catch(
            error => { ////here we process all the failed promises
                const errMsgObj = {errMessage: error};
                document.getElementById(targetElem).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    )
            }
        )
}

function insertArticle(targetElm) {

    //idArticle, page
    /*
    fetch(url_addres, {method: "POST"})
        .then(
            () => fetchAndDisplayArticles(targetElem, page)
        )
        .catch(
            error => { ////here we process all the failed promises
                const errMsgObj = {errMessage: error};
                document.getElementById(targetElem).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    )
            }
        )
        */
    let articleForm = {};

    articleForm.formTitle = "Article Insert";
    articleForm.formSubmitCall = `processArtEditFrmData(event,null,null,'${url}',true)`;
    articleForm.submitBtTitle = "Save article";
    //articleForm.url = url_address;

    /*
    //`#article/${article.id}/${page};
    articleForm.backLink = `#article/${artIdFromHash}/${page}`;
    */
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            articleForm
        );

}