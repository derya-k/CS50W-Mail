document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

 

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#full-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //When form submit take information
    document.querySelector("#compose-form").onsubmit=()=>{
    let recipients=document.querySelector("#compose-recipients").value;
    let subject =document.querySelector("#compose-subject").value;
    let body= document.querySelector("#compose-body").value;

    //Save email
    fetch("/emails", {
      method :"POST",
      body:JSON.stringify({
        recipients :recipients,
        subject : subject,
        body: body
      })
    }).then(response => response.json())
    .then(result => {
      console.log(result);
      if(result.error === undefined){
        load_mailbox("sent");
      }else{
        console.log(result.error)
      }
     
    });
    return false;
  }
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox)
  
  //Show all email related page 
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(result =>{
    if(result){
      result.forEach(sentMail =>{
      let sentDiv=document.createElement("div")
      
      //if email is "read" add read class else add emails-block class
      sentDiv.innerHTML=`<div class="${sentMail["read"]? "read":"emails-block"}"><div id="emails-recipients" class="emails-recipients">From: ${sentMail.sender} </div>
      <div class="emails-subject">Subject: ${sentMail.subject} <span class="email-date">Date:  ${sentMail.timestamp}</span></div><br></div>
      `
    //Create button for archive/unarchive
    let btnArchive=document.createElement("button")
    btnArchive.setAttribute("class","archive-toggle")
    
    document.querySelector("#emails-view").append(sentDiv)
    
    //Archive button for inbox page
    if(mailbox == "inbox"){
      btnArchive.innerHTML="Archive";
      document.querySelector("#emails-view").append(btnArchive)
    
    //Unarchive button for archive page
    }else if(mailbox == "archive"){
      btnArchive.innerHTML="Unarchive";
      document.querySelector("#emails-view").append(btnArchive)
      
    }
    //Change archive status when button is clicked
     btnArchive.addEventListener("click",()=>{
      archive_toggle(sentMail)
     })
    
    //Mark as read when email is sent
     sentDiv.addEventListener("click",()=>{
      read(sentMail)
    })
    
    })
  }
  })
}

//Function for change archive status
function archive_toggle(email){ 
    
    fetch(`emails/${email["id"]}`,{
        method: "PUT",
        body: JSON.stringify({
          archived:!email["archived"]
        })
      }).then(()=> load_mailbox("inbox"))
}

//Fuction for mark an email as read 
function read(email){
 
  fetch(`emails/${email["id"]}`,{
    method: "PUT",
    body: JSON.stringify({
      read:true
    })
  }).then(()=> fullMail(email))
}

function fullMail(email){
   // Show full-view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-view').style.display = 'block';
  
  //Clean inside teh full-view
  document.querySelector('#full-view').innerHTML=""
  let full_view=document.querySelector("#full-view");
  let infoDiv=document.createElement("div")
  infoDiv.innerHTML=`<div class="main">
  <div class="info-div">Form: ${email["sender"]}</div>
  <div class="info-div">To: ${email["recipients"]}</div>
  <div class="info-div">Subject: ${email["subject"]}</div>
  <div class="info-div">Body: ${email["body"]}</div>
  <div class="info-div-date">Date: ${email["timestamp"]}</div>
  <button id="reply" class="reply" >Reply</button>
  </div>`
  full_view.append(infoDiv)
  let replyBtn=document.querySelector("#reply")
  replyBtn.addEventListener("click",()=>{
    reply(email)
  })
}

//Function for reply emails
function reply(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#full-view').style.display = 'none';
  
  //Fill compose-form fields
  let to=document.querySelector("#compose-recipients")
  to.value=`${email["sender"]}`
  let subject=document.querySelector("#compose-subject")
  subject.value=`Re: ${email["subject"] }`
  let body=document.querySelector("#compose-body")
  body.innerHTML=`${email["timestamp"]} ${email["sender"] } wrote: ${email["body"]}`
    
   //When form submit take information
    document.querySelector("#compose-form").onsubmit=()=>{
      let recipients=document.querySelector("#compose-recipients").value;
      let subject =document.querySelector("#compose-subject").value;
      let body= document.querySelector("#compose-body").value;
      console.log("AAHBXBXH")
      //Save email
      fetch("/emails", {
        method :"POST",
        body:JSON.stringify({
          recipients :recipients,
          subject : subject,
          body: body
        })
      }).then(response => response.json())
      .then(result => {
        console.log(result);
        if(result.error === undefined){
          load_mailbox("sent");
        }else{
          console.log(result.error)
        }
       
      });
      return false;
    }
}
