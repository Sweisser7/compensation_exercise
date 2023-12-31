/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Animal {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }
}

function add(resource, sibling) {

    console.log(resource.gender);

    if (resource.gender === true) {
        genderOutput = "Male";
    } else {
        genderOutput = "Female";
    };



    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    creator
        .append(new ElementCreator("h2").text(resource.kind))
        .append(new ElementCreator("strong").text("Age: " + resource.age + " years"))
        .append(new ElementCreator("br"))
        .append(new ElementCreator("strong").text("Gender: " + genderOutput))
        .append(new ElementCreator("br"));

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', (e) => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
               
               let deleteUrl = '/api/animal/resources/' + resource.id;
               fetch(deleteUrl, {
                method: 'DELETE',
               }).then(response => { // promise to use the response of api call
                if (response.status === 204) {
                    console.log('API call succeed');
                } else if (response.status === 404) {
                    console.error('Resource not found.')
                } else {
                    console.error('Request failed with status:' + response.status);
                }
                if (response.status === 204) {
                    remove(resource); // <- This call removes the resource from the DOM. Call it after (and only if) your API call succeeds!
                }
               })
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
}

function edit(resource) {

    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.kind));
        
    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below).
    */

    formCreator
        .append(new ElementCreator("label").text("Kind").with("for", "resource-kind"))
        .append(new ElementCreator("input").id("resource-kind").with("type", "text").with("value", resource.kind))
        .append(new ElementCreator("br"))
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number").with("value", resource.age))
        .append(new ElementCreator("br"));

    formCreator
        .append(new ElementCreator("label").text("Gender").with("for", "resource-gender"))
        .append(new ElementCreator("input").with("type", "radio").id("resource-gender").with("name", "resource-gender").with("value", true))
        .append(new ElementCreator("label").text("Male").with("for", "resource-gender"))
        .append(new ElementCreator("input").with("type", "radio").id("resource-gender").with("name", "resource-gender").with("value", false))
        .append(new ElementCreator("label").text("Female").with("for", "resource-gender"));

    

    /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
    formCreator
        .append(new ElementCreator("button").text("Save").listener('click', (event) => {
            /* Why do we have to prevent the default action? Try commenting this line. */
            event.preventDefault(); 
            // The browser does a default action on a event-object but we handle the form submit on our own so we cancel the default submit.

            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
            resource.kind = document.getElementById("resource-kind").value;
            resource.age = document.getElementById("resource-age").value;
            resource.gender = document.getElementById("resource-gender").value;

            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */
               let updateUrl = '/api/animal/resources/';
               let requestData = {kind: resource.kind, age: resource.age, gender: resource.gender};
               
               fetch(updateUrl, requestData, {
                method: 'PUT',
               }).then(response => {
                if (response.status === 200) {
                    console.log('API call succeed');
                    console.log(response.body);
                } else if (response.status === 404) {
                    console.error('Resource not found.')
                } else {
                    console.error('Request failed with status:' + response.status);
                }
                if (response.status === 200) {
                    add(resource, document.getElementById(resource.idforDOM)); // <- Call this after the resource is updated successfully on the server
                }
               })
        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {

    const formCreator = new ElementCreator("form");
    formCreator.insertBefore(document.getElementById("new"), document.getElementById("resource-1"));

    formCreator
        .append(new ElementCreator("h3").text("Add new Animal"))
        .append(new ElementCreator("label").text("Kind").with("for", "resource-kind"))
        .append(new ElementCreator("input").id("resource-kind").with("type", "text"))
        .append(new ElementCreator("br"))
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number"))
        .append(new ElementCreator("br"))
        .append(new ElementCreator("label").text("Gender").with("for", "resource-gender"))
        .append(new ElementCreator("input").with("type", "radio").id("resource-gender").with("name", "resource-gender").with("value", true))
        .append(new ElementCreator("label").text("Male").with("for", "resource-gender"))
        .append(new ElementCreator("input").with("type", "radio").id("resource-gender").with("name", "resource-gender").with("value", false))
        .append(new ElementCreator("label").text("Female").with("for", "resource-gender"));
        

    formCreator
        .append(new ElementCreator("button").text("Create").listener('click', async (event) => {
            event.preventDefault();

            kind = document.getElementById("resource-kind").value;
            age = document.getElementById("resource-age").value;
            gender = document.getElementById("resource-gender").value;

                let createUrl = '/api/animal/resources/';
                let requestData = {kind: kind, age: age, gender: gender};

                const xhr = new XMLHttpRequest();
                xhr.open('POST', createUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function () { //function run when state of xhr status changes
                    if (xhr.readyState === XMLHttpRequest.DONE) { //check if request is finished
                        if (xhr.status === 200) {
                            const responseData = JSON.parse(xhr.responseText); // changes responsetext into json
                            console.log(responseData);
                        } else {
                            console.error('API Error: ', xhr.status, xhr.statusText);
                        }
                    }
                }
                xhr.send(JSON.stringify(requestData)); // sends request message with data in json format 
                
                add(requestData, document.getElementById(requestData.idforDOM));
                location.reload();
        }))
}


document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/animal/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Animal(), resource));
            }
        });
});

