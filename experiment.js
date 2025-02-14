/* ************************************ */
/* Define helper functions */
/* ************************************ */
const BUCKET_NAME = "dimensional-set-shifting-experiment-2024"

function startMyTimer() {
	let timer;
	kick_on_timeout = true;
	const resetTimer = () => {
	  if (timer) {
		clearTimeout(timer);
	  }
	  timer = setTimeout(function() {
  
	  if(kick_on_timeout){
		console.log('90 seconds have passed');
		jsPsych.endCurrentTimeline();
		local_global_letter_experiment = [error_block];
		jsPsych.init({
		  timeline: local_global_letter_experiment
		});
	  }
	  }, 5000);
	};
  
	document.addEventListener('keydown', resetTimer);
	resetTimer(); // Start the timer initially
  }

function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = "center-block-text">' +
		feedback_instruct_text + '</p></div>'
}

function get_stim() {
	/* This function takes the stim (either 2 in one dimension, or 4, 2 from each of the 2 dimensions), pairs them together
	(if necessary, as in the 2 dimension conditions) and displays them in random boxes
	*/
	if (stims.length == 2) {
		stim1 = stims[0]
		stim2 = stims[1]
	} else if (stims.length == 4) {
		if (Math.random() < 0.5 || version2_repeat >= 3 && version1_repeat < 3) {
			stim1 = stims[0] + stims[2]
			stim2 = stims[1] + stims[3]
			version2_repeat = 0
			version1_repeat += 1
		} else {
			stim1 = stims[0] + stims[3]
			stim2 = stims[1] + stims[2]
			version2_repeat += 1
			version1_repeat = 0
		}
	}
	if (reversal === false) {
		target = stim1
	} else {
		target = stim2
	}
	contents = jsPsych.randomization.shuffle(['', '', stim1, stim2])
	stim = '<div class = leftbox>' + contents[0] + '</div><div class = topbox>' + contents[1] +
		'</div><div class = rightbox>' + contents[2] + '</div><div class = bottombox>' + contents[3] +
		'</div>'
	return stim
}

function get_correct_response() {
	return responses[contents.indexOf(target)]
}

function get_data() {

	return {
		trial_id: 'stim',
		exp_stage: 'test',
		condition: stages[stage_counter],
	}
}

function getProlificId(){
	const urlParams = new URL(location.href).searchParams;

// Get parameters by name
	return urlParams.get('PROLIFIC_PID')
}

function getExpURL(){
	const urlParams = new URL(location.href).searchParams;

// Get parameters by name
	//console.log("getting expUrl")
	let expurl =  urlParams.get('expUrl');
	let pid = urlParams.get('PROLIFIC_PID');
	let stud = urlParams.get('studID');
	let sess = urlParams.get('sessID');
	return expurl +"/?PROLIFIC_PID="+ pid + "&studID=" + stud + "&sessID=" + sess;
}

function getErrorURL(){
	const urlParams = new URL(location.href).searchParams;

// Get parameters by name
	//console.log("getting expUrl")
	let expurl =  urlParams.get('iferror');
	let pid = urlParams.get('PROLIFIC_PID');
	let stud = urlParams.get('studID');
	let sess = urlParams.get('sessID');
	return expurl +"/?PROLIFIC_PID="+ pid + "&studID=" + stud + "&sessID=" + sess;
}

function saveData() {
	// Retrieve data from jsPsych

	let subject = getProlificId()
	var data = jsPsych.data.dataAsJSON()// Get data as JSON string

	// Make a POST request to the Lambda function or API Gateway endpoint
	$.ajax({
		url: 'https://hss74dd1ed.execute-api.us-east-1.amazonaws.com/dev/', // Replace with your API Gateway/Lambda endpoint
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			"subject_id": `${subject}`,
			"bucket": `${BUCKET_NAME}`,
			"exp_data": JSON.stringify(data)
				}),
		success: function(response) {
			console.log('Data uploaded successfully:', response);
		},
		error: function(xhr, status, error) {
			console.error('Error uploading data:', error);
		}
	});
}

function downloadJSON(data, filename) {
	const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
	const blob = new Blob([jsonData], { type: 'application/json' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click(); // Automatically triggers the download
}

function showErrorMessage() {
	const email = "comdepri+shir_neh@mail.huji.ac.il";

	// Copy the email to the clipboard
	navigator.clipboard.writeText(email).then(() => {
		console.log("Email address copied to clipboard.");
	}).catch(err => {
		console.error("Failed to copy email address to clipboard:", err);
	});

	// Update the page content
	document.body.innerHTML = `
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 20vh;">
      <h1 style="color: sandybrown;">There was an error saving the experiment data</h1>
      <p>It has been saved on your computer. Please send us the file to the following email address:</p>
      <p><a href="mailto:${email}" style="color: blue; text-decoration: underline;">${email}</a></p>
      <p style="color: gray;">(The email address has been copied to your clipboard.)</p>
      <p>Press <strong>Enter</strong> to continue.</p>
    </div>
  `;

	// Listen for the Enter key
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			window.location.href = getExpURL();
		}
	});
}

function uploadDataWithRetryOld(retryCount = 3, delay = 1000) {

	let subject = getProlificId();
	let data = jsPsych.data.dataAsJSON();// Get data as JSON string

	$.ajax({
		url: 'https://hss74dd1ed.execute-api.us-east-1.amazonaws.com/dev/',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			"subject_id": `${subject}`,
			"bucket": `${BUCKET_NAME}`,
			"exp_data": JSON.stringify(data)
		}),
		success: function(response) {
			console.log('Data uploaded successfully:', response);
			window.location.href = getExpURL();
		},
		error: function(xhr, status, error) {
			console.error(`Error uploading data (${retryCount} retries left):`, error);
			if (retryCount > 0) {
				setTimeout(() => {
					uploadDataWithRetry(retryCount - 1, delay * 2); // Double the delay
				}, delay);
			} else {
				console.error('All retry attempts failed.');
				downloadJSON(data, 'tol_results_' + subject);
				showErrorMessage()
			}
		}
	});
}

function uploadDataWithRetry(lastTry=false, endTest=true ,retryCount = 5, delay = 1000) {
	let subject = getProlificId();
	let data = jsPsych.data.dataAsJSON(); // Get data as JSON string

	return new Promise((resolve, reject) => {
		function attemptUpload(remainingRetries) {
			$.ajax({
				url: 'https://hss74dd1ed.execute-api.us-east-1.amazonaws.com/dev/',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					"subject_id": `${subject}`,
					"bucket": `${BUCKET_NAME}`,
					"exp_data": JSON.stringify(data)
				}),
				success: function(response) {
					console.log('Data uploaded successfully:', response);
					resolve(response); // Resolve the promise on success
					if(endTest) {
						window.location.href = getExpURL();
					}
				},
				error: function(xhr, status, error) {
					let errorMessage = xhr.responseText || "Unknown Status Msg";
					let errorCode = xhr.status || "Unknown Status Code";

					jsPsych.data.addDataToLastTrial({"upload_error": errorMessage + " - " + errorCode});
					console.error(`Error uploading data (${remainingRetries} retries left):`, error);
					if (remainingRetries > 0) {
						setTimeout(() => {
							attemptUpload(remainingRetries - 1); // Retry with reduced retry count
						}, delay);
					} else {
						console.error('All retry attempts failed.');
						if(lastTry) {
							downloadJSON(data, 'tol_results_' + subject); // Download data locally
							showErrorMessage(); // Display error message
						}
						reject(new Error('All retry attempts failed.')); // Reject the promise on failure
					}
				}
			});
		}

		attemptUpload(retryCount); // Start the upload process
	});
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
kick_on_timeout = false
// Set up task variables
var responses = [37, 38, 39, 40]

if(getProlificId() === "test"){
	var blocks = ['simple'] //Simple: 1 dimension alone, separate: 2 dimensions side-by-side, compound: overlapping
	var stages = ['simple']
	var max_trials = 2
} else {
	var blocks = ['simple', 'separate', 'compound', 'ID', 'ED'] //Simple: 1 dimension alone, separate: 2 dimensions side-by-side, compound: overlapping
	var stages = ['simple', 'simple_rev', 'separate', 'compound', 'compound_rev', 'ID', 'ID_rev', 'ED',
		'ED_rev']
	var max_trials = 50
}

// Set up variables for stimuli
var path = 'images/'
var center_prefix = '<div class = centerimg><img style="height: 80%; width: auto; '
var left_prefix = '<div class = leftimg><img style="height: 80%; width: auto; '
var right_prefix = '<div class = rightimg><img style="height: 80%; width: auto; '
var postfix = '"</img></div>'
var shape_stim = jsPsych.randomization.shuffle(['Shape_1.png', 'Shape_2.png', 'Shape_3.png',
	'Shape_4.png', 'Shape_5.png', 'Shape_6.png', 'Shape_7.png', 'Shape_8.png'
])
var line_stim = jsPsych.randomization.shuffle(['Line_1.png', 'Line_2.png', 'Line_3.png',
	'Line_4.png', 'Line_5.png', 'Line_6.png', 'Line_7.png', 'Line_8.png'
])
if (Math.random() < 0.5) {
	var Dim1_stim = shape_stim
	var Dim2_stim = line_stim
	var Dim1_z = 'z-index: 1;" src = "'
	var Dim2_z = 'z-index: 2;" src = "'
} else {
	var Dim1_stim = line_stim
	var Dim2_stim = shape_stim
	var Dim1_z = 'z-index: 2;" src = "'
	var Dim2_z = 'z-index: 1;" src = "'
}

//instruction stim
var instruction_stim = '<div class = leftbox>' + center_prefix + Dim1_z + path + Dim1_stim[6] +
	postfix + '</div><div class = topbox>' + center_prefix + Dim1_z + path + Dim1_stim[7] + postfix +
	'</div><div class = rightbox></div><div class = bottombox></div>'

//initialize global variables used by functions
var contents = [] //holds content of each box (left, up, right, down)
var correct_counter = 0 // tracks number of correct choices in each stage
var stage_counter = 0 // tracks number of stages
var trial_counter = 0 // tracks trials in each stage
var wrong_counter = 0 // tracks wrong trials
var stage_over = 0 // when this variable equals 1 the experiment transitions to the next stage
var end_experiment = 0
var target = '' // target is one of the stims
var stims = []
var reversal = false
var version1_repeat = 0
var version2_repeat = 0


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>'],
   rows: [15],
   columns: [60],
};

/* define static blocks */
var feedback_instruct_text =
	'Welcome to the experiment. This experiment will last around 10 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'instruction'
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: 'instruction'
	},
	pages: [
		'<div class = centerbox><p class = "block-text">' + 'In this task, you will see two patterns placed in two of the four boxes on the screen (as shown on the next screen). One of the patterns is correct. You must select the one you think is correct by pressing the arrow key corresponding to the correct box (left, right, up, or down).', + '</p>' +
		instruction_stim +
		'<div class = betweenStimBox><div class = "center-text">An example trial.</div></div>',
		'<div class = centerbox><p class = "block-text">In this task, there are changing rules you need to follow to ensure you make the correct choice each time. You will receive feedback after each attempt to let you know whether you are right or wrong. The computer will track your performance, and when it is clear that you know the rule, the computer will change it without notifying you. If you fail to understand the rule after too many attempts, the task will end.</p></div>',
		'<div class = centerbox><p class = "block-text">The task will now begin. Initially, there is nothing on the screen to indicate which of the two patterns is correct, so your first choice will be a simple guess.\n</p></div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000,
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	},
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'dimensional_set_shifting'
	},
	text: '<div class="centerbox"><p class="center-block-text">Thanks for completing this task!<br>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function() {
		uploadDataWithRetry(false)
	}
};


var error_block = {
	type: 'poldrack-text',
	timing_response: 3000, // Set the timeout to 5 seconds
	data: {
		trial_id: "end",
		exp_id: 'dimensional_set_shifting'
	},
	text: '<div class="centerbox"><p class="center-block-text">You failed to understand the rule within 50 attempts, we will proceed now to the .\n' +
		'The task will now end, and your participation in the study will be incomplete.</p></div>',
	cont_key: [], // Disable key press
	timing_post_trial: 0,
	on_finish: function () {
		uploadDataWithRetry(true)
	}
};


var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 500,
	timing_stim: 500,
	timing_response: 500
}


var manual_upload_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
		exp_id: 'tower_of_london'
	},
	timing_response: 180000,
	text: `
    <div class="centerbox" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center;">
  <p class="center-block-text" style="margin-bottom: 20px;">Please wait while your data is being uploaded</p>
  <p class="center-block-text" style="margin-bottom: 20px;"> If you are not redirected automatically, click the 'Upload' button.</p>
  <button id="uploadButton" class="button" style="padding: 10px 20px; font-size: 16px; cursor: pointer; text-align: center;">Upload</button>
  <p id="countdown" style="display: none; margin-top: 20px; font-size: 14px;">Please wait <span id="timer">20</span> seconds before trying again.</p>
</div>`,
	cont_key: [1],
	timing_post_trial: 0,
	on_load: function () {
		setTimeout(() => { // Ensure DOM is fully loaded
			let uploadAttempts = 0;
			const maxAttempts = 3;
			const uploadButton = document.getElementById('uploadButton');
			const countdownText = document.getElementById('countdown');
			const timerSpan = document.getElementById('timer');

			// Ensure the uploadButton is found
			if (!uploadButton) {
				console.error("Upload button not found in the DOM.");
				return;
			}

			// Disable button with countdown
			function startCountdown() {
				let remainingTime = 10;
				uploadButton.disabled = true;
				uploadButton.classList.add('disabled');
				countdownText.style.display = 'block';

				const interval = setInterval(() => {
					remainingTime -= 1;
					timerSpan.textContent = remainingTime;

					if (remainingTime <= 0) {
						clearInterval(interval);
						uploadButton.disabled = false;
						uploadButton.classList.remove('disabled');
						countdownText.style.display = 'none';
					}
				}, 1000);
			}

			// Handle button click
			uploadButton.addEventListener('click', () => {
				startCountdown();
				let isLastTry = false;
				if (uploadAttempts >= maxAttempts) {
					isLastTry = true;
				}
				uploadDataWithRetry(isLastTry)
					.then(() => {
						alert('Upload succeeded! Redirecting...');
						window.location.href = getExpURL(); // Replace with your success page URL
					})
					.catch(() => {
						uploadAttempts += 1;
					});
			});
		}, 0); // Defer execution to ensure DOM is ready
	},
	on_finish: function () {
		console.log("Manual upload block completed.");
	}
};


var define_simple_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_simple_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2]
	},
	timing_post_trial: 0
}

var define_separate_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_separate_stims"
	},
	func: function() {
		var Dim1_stim1 = left_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = left_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		var Dim2_stim1 = right_prefix + Dim2_z + path + Dim2_stim[0] + postfix
		var Dim2_stim2 = right_prefix + Dim2_z + path + Dim2_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_compound_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_compound_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[0] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_ID_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_ID_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[2] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[3] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[2] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[3] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_ED_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_ED_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[4] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[5] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[4] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[5] + postfix
		stims = [Dim2_stim1, Dim2_stim2, Dim1_stim1, Dim1_stim2]
	},
	timing_post_trial: 0
}

var reverse_stims = {
	type: 'call-function',
	data: {
		trial_id: "reverse_stims"
	},
	func: function() {
		reversal = !reversal
	},
	timing_post_trial: 0
}

/* create experiment definition array */
dimensional_set_shifting_experiment = []
dimensional_set_shifting_experiment.push(instruction_node)
	/* define test trials */
for (b = 0; b < blocks.length; b++) {
	block = blocks[b]
	if (block == 'simple') {
		dimensional_set_shifting_experiment.push(define_simple_stims)
	} else if (block == 'separate') {
		dimensional_set_shifting_experiment.push(define_separate_stims)
	} else if (block == 'compound') {
		dimensional_set_shifting_experiment.push(define_compound_stims)
	} else if (block == 'ID') {
		dimensional_set_shifting_experiment.push(define_ID_stims)
	} else if (block == 'ED') {
		dimensional_set_shifting_experiment.push(define_ED_stims)
	}

	var stage_block = {
		type: 'poldrack-categorize',
		stimulus: get_stim,
		is_html: true,
		key_answer: get_correct_response,
		correct_text: '<div class = centerbox><div class = "center-text"><font size = 20>Correct</font></div></div>',
		incorrect_text: '<div class = centerbox><div class = "center-text"><font size = 20>Incorrect</font></div></div>',
		choices: responses,
		timing_response: -1,
		timing_stim: -1,
		timing_feedback_duration: 500,
		show_stim_with_feedback: true,
		data: get_data,
		timing_post_trial: 100,
		on_finish: function(data) {
			trial_counter++
			if (data.correct === true) {
				correct_counter++
			} else {
				wrong_counter++
				console.log("wrong" + wrong_counter)
				correct_counter = 0
			}
			if(trial_counter === max_trials){
				stage_over = 1
				end_experiment = true

			}
			if (correct_counter === 6) {
				stage_over = 1
				saveData()
			}
			// Log the number of remaining trials for this stage
			//console.log(`Trial ${trial_counter} completed.`);
			//console.log(`Currect count is ${correct_counter}.`);
		}
	}
	var stage_node = {
		timeline: [fixation_block, stage_block],
		loop_function: function(data) {

			 if (end_experiment) {
			 	jsPsych.getDisplayElement().innerHTML = ''; // Clear the display
			 	jsPsych.init({
			 		timeline: [end_block, manual_upload_block]
			 	});
			 	return false;
			 }

			if (stage_over == 1) {
				stage_over = 0
				correct_counter = 0
				wrong_counter = 0
				trial_counter = 0
				stage_counter += 1
				//console.log(`Stage Over.`);
				return false
			} else {
				return true
			}
		}
	}
	dimensional_set_shifting_experiment.push(stage_node)

	if (block != 'separate') {
		dimensional_set_shifting_experiment.push(reverse_stims)
		dimensional_set_shifting_experiment.push(stage_node)
	}
}
dimensional_set_shifting_experiment.push(end_block)
dimensional_set_shifting_experiment.push(manual_upload_block)

