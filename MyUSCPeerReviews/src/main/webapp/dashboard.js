/*
stuff to be done on load of page
*/
window.addEventListener('load', function() {
    console.log('Page and all resources have finished loading');
    // logout for user, signup for guest
    let name = document.getElementById("nameinner");
    name.textContent = getCookie("username");
    caterPage();
    runMatch();
    getEssays();
});

/*
returns the value of a the "name" cookie
*/
function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    for (const cookie of cookieArray) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

/*
displays the correct buttons on the page based on whether the user is a guest or registered account
*/
function caterPage(){
	let backtodash = document.getElementById("backtodash");
	let startreview = document.getElementById("startreview");
	if (!checkLogin()){ // guest
		backtodash.innerHTML = "Register Account";
		backtodash.onclick = function() {
			window.location.href = "login.html";
		};
		startreview.onclick = function() {
			window.location.href = "guest_start_project.html";
		};
	} else { // user
		backtodash.innerHTML = "Logout";
		backtodash.onclick = function() {
			logout();
			window.location.href = "login.html";
		};
		startreview.onclick = function() {
			window.location.href = "user_start_project.html";
		};
	}
}

/*
logs a user out
*/
function logout(){
    console.log("in logout()");
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/*
checks if a user is registerd or a guest
*/
function checkLogin() {
	console.log("here");
	const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const userIDCookie = cookies.find(cookie => cookie.startsWith('user_id='));
    const usernameCookie = cookies.find(cookie => cookie.startsWith('username='));
    const userIDval = userIDCookie.split("=")[1];
    const usernameval = usernameCookie.split("=")[1];
    console.log("userIDCookie: " + userIDval);
    console.log("usernameCookie: " + usernameval);
    if (usernameval === "guest"){
		return false;
	}
	return true;
}

/*
runs the matching algorithm
*/
function runMatch(){
	fetch('MatchUserServlet', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		if (response.ok){
			return response.text();
			
		} else {
			throw new Error('Request failed');
		}
	})
	.then(data => {
		console.log("data: "+data);
	})
	.catch(error => {
  	console.error('Error:', error);
	})
}

/*
retrieves a users essays their status from the backend
*/
function getEssays(){
	fetch('DashboardServlet', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		if (response.ok){
			return response.json();
			
		} else {
			throw new Error('Request failed');
		}
	})
	.then(data => {
		console.log(data);
		let projects = document.getElementById("projects");
		if (projects != "") {
			projects.innerHTML = "";
		}
		let jsondata = getEssayData(data);
		console.log(jsondata);
		displayEssays(jsondata);
	})
	.catch(error => {
  	console.error('Error:', error);
	})
}

/*
reformats the essays to be displayed easier
*/
function getEssayData(data) {
	let essays = data["essays"];
	let e = {};
	for (let i=0; i < essays.length; i++) {
		e[i] =  essays[i];
	}
	return e;
}

/*
send the user to review_page.html with the proper url
*/
function clickReview(btn){
	var btnval = btn.getAttribute('value');
	console.log("btnval in click: "+btnval);
    window.location.href = `review_page.html?matched_id=`+btnval;
}
/*
download the feedback for the associated essay
*/
function clickDownload(btn){
	var btnval = btn.getAttribute('value');
	console.log("btnval in download: "+btnval);
    fetch('FeedbackServlet?essay_id='+btnval, {
		method: 'GET',
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
		    return response.blob();
		})
		.then(blob => {
		    // Create a URL for the blob
			const url = window.URL.createObjectURL(blob);
		
			// Create a temporary anchor element
		    const a = document.createElement('a');
		    a.href = url;
			
		    // Set the file name for the download
			a.download = 'feedback.pdf';
			
			// Append the anchor to the body and simulate a click
		    document.body.appendChild(a);
		    a.click();
			
		    // Clean up: remove the anchor and revoke the object URL
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		})
		.catch(error => {
		    console.error('There was a problem with the fetch operation:', error);
	});
}

/*
displays a user's essays on dashboard.html
*/
function displayEssays(essayJson){
	for (key in essayJson) {
		let essay = essayJson[key];
		let projects = document.getElementById("projects");
		let moreHTML = `
		<div class="essay">
			<div class="essayname">
				<p id="essay_name"></p>
	  		</div>
		  	<div class="essaydetails">
		  		<p class="tags"></p>
				<button class="unmatchedbtn">Unmatched</button>
				<button class="reviewbtn" onclick="clickReview(this)">Review Matched Essay</button>
				<button class="downloadbtn" onclick="clickDownload(this)">Download Feedback </button>
		  	</div>
		</div>
	  	`;

		projects.innerHTML += moreHTML;
		
		let essayDisplays = projects.getElementsByClassName("essay");

		let tempEssay = essayDisplays[essayDisplays.length - 1];
		let tempEN = tempEssay.querySelector("#essay_name");
		let tempT = tempEssay.querySelector(".tags");
		let tempU = tempEssay.querySelector(".unmatchedbtn");
		let tempR = tempEssay.querySelector(".reviewbtn");
		let tempD = tempEssay.querySelector(".downloadbtn");
		
		
		tempR.value = essay["matched_id"];
		tempD.value = essay["essay_id"];
		
		
		tempEN.innerHTML = essay["essay_name"];
		let temptags = essay["tags"];
		console.log("temptags: "+temptags);
		if (temptags === null || temptags === "tags null"){
				tempT.innerHTML = "Essay Tags: ";
		} else {
				tempT.innerHTML = "Essay Tags: "+temptags;
		}
		// tempT.innerHTML = "Essay Tags: "+essay["tags"];
		
		console.log("essay_name: "+ essay["essay_name"]);
		console.log("matched_id: "+essay["matched_id"]);
		console.log("status: "+essay["status"]);
		console.log("feedback_id: "+essay["feedback_id"]);
		
		if (essay["matched_id"] === null){ // unmatched, just display unmatched with 
			tempU.style.display = 'block';
			tempR.style.display = 'none';
			tempD.style.display = 'none';
		}
		else if (essay["status"] === "pending" || essay["feedback_id"] === null) { // matched, waiting for both to finish reviews
			tempU.style.display = 'none';
			tempR.style.display = 'block';
			tempD.style.display = 'none';

		} else { // finished, call download essay
			tempU.style.display = 'none';
			tempR.style.display = 'none';
			tempD.style.display = 'block';

		}
	}
}