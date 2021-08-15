/*** NEW CLASSES TO MAKE DICTIONARY STYLE OBJECTS ***/

class Language {
    constructor() {
      this.objects = {}
    }

    get_word(shape, fill) {
      return this.objects[shape][fill];
    }

    set(shape, fill, word) {
    	if (!(shape in this.objects)) {
      	this.objects[shape] = {}
      }
      this.objects[shape][fill] = word;
    }
}

class MeaningSpace {
  constructor() {
    this.objects = {}
  }

  set(stim, meaning) {
    if (!(stim in this.objects)) {
      this.objects[stim] = {}
    }
    this.objects[stim] = meaning
  }

  get_meaning(stim) {
    return this.objects[stim]
  }
}


/*** MEANING SPACE AND STIMS ***/

var shapes = ["square", "triangle", "circle"]
var fill_patterns = ["checkerboard", "striped", "spotted"]

var stim_list = []
for (var i = 1; i < 10; i++) {
  // Change this path if the stimuli are saved somewhere different on your server
  stim_list.push("stimuli/stim0" + i + ".png")
}

var stim_dict = new MeaningSpace()
stim_dict.set(stim_list[0], [shapes[0], fill_patterns[0]])
stim_dict.set(stim_list[1], [shapes[0], fill_patterns[1]])
stim_dict.set(stim_list[2], [shapes[0], fill_patterns[2]])
stim_dict.set(stim_list[3], [shapes[1], fill_patterns[0]])
stim_dict.set(stim_list[4], [shapes[1], fill_patterns[1]])
stim_dict.set(stim_list[5], [shapes[1], fill_patterns[2]])
stim_dict.set(stim_list[6], [shapes[2], fill_patterns[0]])
stim_dict.set(stim_list[7], [shapes[2], fill_patterns[1]])
stim_dict.set(stim_list[8], [shapes[2], fill_patterns[2]])

var stim_height = 300
var stim_width = 300


/*** LANGUAGES ***/

var shape_syllables = ["gaga", "bebe", "tutu", "popo", "kiki", "huhu", "momo", "lala", "nene"]
var fill_syllables = ["ni", "do", "lu", "va", "su", "bi", "fa", "ri", "pa"]

function make_language(structure, shapes, fill_patterns, shape_syllables, fill_syllables) {

  // The cell selection we do for partially compositional languages only works for a square meaning space, so if the meaning space is not square
  // we want to exit without trying to execute anything else
  if (shapes.length != fill_patterns.length) {
    console.log("This meaning space is not a square and the make_language function will not work.")
    return null
  }

  // Exit without executing anything else if there's a typo in the structure type
  var structures = ['compositional', 'holistic', 'partial']
  if (!structures.includes(structure)) {
    console.log("Invalid structure type.")
    return null
  }

  // Regardless of structure type, we first want to set up the dimensions of the meaning space and shuffle the syllable arrays until it's no
  // longer possible to get the word 'lava' in any condition
  var dim = shapes.length

  do {
    shape_syllables = jsPsych.randomization.shuffle(shape_syllables)
    fill_syllables = jsPsych.randomization.shuffle(fill_syllables)
  } while ((shape_syllables.indexOf("lala") == fill_syllables.indexOf("va")) || (shape_syllables.indexOf("lala") < dim && fill_syllables.indexOf("va") < dim))

  // If holistic, pick a syllable per shape and then randomly pair these with all nine fill fill_syllables
  if (structure == 'holistic') {
    language = new Language()
    k = 0
    for (var i = 0; i < dim; i++) {
      for (var j = 0; j < dim; j++) {
        language.set(shapes[i], fill_patterns[j], (shape_syllables[i] + fill_syllables[k]))
        k++
      }
    }
  }

  // Otherwise, make a fully compositional language first and then add exception words if partially compositional
  else {
    language = new Language()
    for (var i = 0; i < dim; i++) {
      for (var j = 0; j < dim; j++) {
        language.set(shapes[i], fill_patterns[j], (shape_syllables[i] + fill_syllables[j]))
      }
    }

  if (structure == 'partial') {
    // Randomly pick one cell in the grid (shape = x coordinate, fill = y coordinate), then get rid of the fill syllables already used in the
    // compositional language and insert a new word with an irregular suffix in the exception cell
    var shape_exception_indices = jsPsych.randomization.shuffle([...Array(dim).keys()])
    var fill_exception_indices = jsPsych.randomization.shuffle([...Array(dim).keys()])
    var fill_syllables = fill_syllables.slice(dim)

    for (var i = 0; i < 2; i++) {
      language.set(shapes[shape_exception_indices[i]], fill_patterns[fill_exception_indices[i]], (shape_syllables[shape_exception_indices[i]] + fill_syllables[i]))
    }
    }
  }

  return language
}


/*** PSEUDO-RANDOM DIGIT SEQUENCES ***/

function check_sequence(seq) {
  // Returns true if a sequence does not contain any sub-sequences where a number n is neighboured on either side by n-1 or n+1
  for (var i = 0; i < seq.length - 1; i++) {
    if ((seq[i+1] == seq[i] + 1) || (seq[i+1] == seq[i] - 1)) {
      return false
    }}
  return true
}

function generate_sequence(seq_len) {
  // Generates number sequences until one meets the criteria above
  var range = []
  for (var i = 0; i < 10; i++) {
    range.push(i)
  }
  do {
    var sequence = jsPsych.randomization.sampleWithoutReplacement(range, seq_len)
  } while (!check_sequence(sequence))
  return sequence
}


/*** UTILITY FUNCTIONS ***/

function normalize_word(word) {
  // Removes punctuations, digits and spaces and sends to lower case
  return word.replace(/[^\w]/g, '').trim().toLowerCase()
}

function normalize_sequence(seq) {
  // Removes punctuation, letters and spaces
  return seq.replace(/[^\d]/g, '').trim()
}

function normalize_filename(filepath) {
  // Returns filenames of the type 'stim01' without path information
  var folder = "stimuli/"
  var file_extension = ".png"
  return filepath.replace(folder, '').replace(file_extension, '')
}


/*** CONDITION ALLOCATION ***/

var load_conditions = ['none', 'low']
var structure_conditions = ['holistic', 'partial', 'compositional']


var allocated_condition = {'load': jsPsych.randomization.shuffle(load_conditions)[0],
                           'structure': jsPsych.randomization.shuffle(structure_conditions)[0]}

var load = allocated_condition['load']
var language_type = allocated_condition['structure']
var language = make_language(language_type, shapes, fill_patterns, shape_syllables, fill_syllables)


/*** TRAINING PHASE ***/

function make_training_trial(stim, word, load, response_type) {
  if (load == 'high') {var seq_len = 6}
  else if (load == 'low') {var seq_len = 3}

  // var seq_len = 3

  if (seq_len) {
    var sequence_array = generate_sequence(seq_len)
    var sequence_to_show = sequence_array.join(' ')
  }

  var display_sequence = {type: 'html-keyboard-response',
                          stimulus: "Please memorize these numbers in order:",
                          choices: jsPsych.NO_KEYS,
                          prompt: "<p style='font-size: 30px'>" + sequence_to_show + "</p>",
                          trial_duration: 2500}

  var image_label_pair = {type: 'image-button-response',
                          stimulus: stim,
                          stimulus_height: stim_height,
                          stimulus_width: stim_width,
                          choices: [],
                          timeline: [{prompt: "<p style='font-size: 30px'>&nbsp</p>",
                                      trial_duration: 1000},
                                     {prompt: "<p style='font-size: 30px'>" + word + "</p>",
                                      trial_duration: 4000}]}

  var recall_sequence = {type: 'survey-html-form',
                         html: "<p>Please enter the numbers you just memorized, in order:<br> \
                                  <input required name='sequence' type='text'/></p>",
                         autofocus: 'sequence',
                         data: {block: 'training',
                                response_type: 'interference',
                                stimulus: 'NA',
                                shape: 'NA',
                                fill_pattern: 'NA',
                                target_word: 'NA',
                                word_typed: 'NA',
                                image_choices: ['NA', 'NA', 'NA'],
                                image_chosen: 'NA',
                                correct_image: 'NA'},
                         on_finish: function(data) {
                           var sequence_typed = normalize_sequence(JSON.parse(data.responses).sequence)
                           var correct_counter = 0
                           for (var i = 0; i < Math.min(sequence_typed.length, sequence_array.length); i++) {
                             if (sequence_typed[i] == sequence_array[i]) {correct_counter++}
                           }
                           data.digits_correct = correct_counter
                           data.target_sequence = sequence_array.join('')
                           data.sequence_typed = sequence_typed
                           save_trial_data(data)
                         }
                       }

  var sequence_feedback = {type: 'html-keyboard-response',
                           stimulus: function() {
                             var digits_correct = jsPsych.data.get().last(1).values()[0].digits_correct
                             var response_time = jsPsych.data.get().last(1).values()[0].rt / 1000
                             return "<p style='font-size: 30px'>You got <b>" + digits_correct + "</b> out of " + seq_len +
                             " numbers in the right position and took <b>" + response_time + "</b> seconds to respond.</p>"
                           },
                           choices: jsPsych.NO_KEYS,
                           trial_duration: 2000}

  // Active training was not used in this experiment run but the code is here if needed
  if (response_type == 'retype') {
    var active_training = {type: 'survey-html-form',
                           html: "<img src=" + stim + " width=" + stim_width + "px height=" + stim_height + "px><br>\
                                 <p style='font-size: 30px'>This object is called:<br> \
                                    <input required name='word' type='text'/></p>",
                           autofocus: 'word',
                           data: {block: 'training',
                                  response_type: 'retype',
                                  stimulus: normalize_filename(stim),
                                  shape: stim_dict.get_meaning(stim)[0],
                                  fill_pattern: stim_dict.get_meaning(stim)[1],
                                  target_word: word,
                                  image_choices: ['NA', 'NA', 'NA'],
                                  image_chosen: 'NA',
                                  correct_image: 'NA',
                                  target_sequence: 'NA',
                                  sequence_typed: 'NA',
                                  digits_correct: 'NA'},
                           on_finish: function(data) {
                             var word_typed = normalize_word(JSON.parse(data.responses).word)
                             if (word_typed == word) {data.correct = true}
                             else {data.correct = false}
                             data.word_typed = word_typed
                             save_trial_data(data)
                           }
                         }

    var active_training_feedback = {type: 'image-button-response',
                                    stimulus: stim,
                                    stimulus_height: stim_height,
                                    stimulus_width: stim_width,
                                    choices: [],
                                    prompt: function() {
                                      var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                                      if (last_trial_correct) {return "<p style='font-size: 30px'>Correct! This is a <b>" + word + "</b>.</p>"}
                                      else {return "<p style='font-size: 30px'>Not quite. This is a <b>" + word + "</b>.</p>"}
                                    },
                                    trial_duration: 2500
                                  }
                                }
  else if (response_type == 'array_selection') {
    var available_stims = stim_list.filter(function(i) {return i !== stim})
    var array_stims = jsPsych.randomization.shuffle([stim, jsPsych.randomization.sampleWithoutReplacement(available_stims, 2)].flat())
    var stims_to_save = []
    for (var stim_filename of array_stims) {
      stims_to_save.push(normalize_filename(stim_filename))
    }

    var active_training = {type: 'html-button-response',
                           stimulus: "<p>&nbsp</p>",
                           choices: array_stims,
                           button_html: '<button class="jspsych-btn"> <img src="%choice%" width=' + stim_width + 'px height=' + stim_height + 'px></button>',
                           prompt: "<p style='font-size: 30px'>Which of these objects is a <b>" + word + "</b>?</p>",
                           data: {block: 'training',
                                  response_type: 'array_selection',
                                  stimulus: normalize_filename(stim),
                                  shape: stim_dict.get_meaning(stim)[0],
                                  fill_pattern: stim_dict.get_meaning(stim)[1],
                                  target_word: word,
                                  word_typed: 'NA',
                                  choices: array_stims,
                                  target_sequence: 'NA',
                                  sequence_typed: 'NA',
                                  digits_correct: 'NA'},
                           on_finish: function(data) {
                             var button_number = data.button_pressed
                             var button_selected = data.choices[button_number]
                             if (button_selected == stim) {data.correct = true}
                             else (data.correct = false)
                             data.image_choices = stims_to_save
                             data.image_chosen = normalize_filename(button_selected)
                             data.correct_image = data.correct
                             save_trial_data(data)
                           }}

    var active_training_feedback = {timeline: [{type: 'html-button-response',
                                                stimulus: "<p>&nbsp</p>",
                                                choices: array_stims,
                                                button_html: '<button class="jspsych-btn"> <img src="%choice%" width=' + stim_width + 'px height=' + stim_height + 'px></button>',
                                                prompt: function() {
                                                  var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                                                  if (last_trial_correct) {return "<p style='font-size: 30px'>Correct!</p>"}
                                                  else {return "<p style='font-size: 30px'>Not quite.</p>"}
                                                },
                                                trial_duration: 500,
                                                response_ends_trial: false},
                                               {type: 'image-button-response',
                                                stimulus: stim,
                                                stimulus_height: stim_height,
                                                stimulus_width: stim_width,
                                                choices: [],
                                                prompt: "<p style='font-size: 30px'>This is a <b>" + word + "</b>.</p>",
                                                trial_duration: 2000,
                                                response_ends_trial: false}]
                                    }
                                  }

  if (load == 'none') {var full_trial = {timeline: [image_label_pair]}}
  else {var full_trial = {timeline: [display_sequence, image_label_pair, recall_sequence, sequence_feedback]}}
  return full_trial
}

function make_training_block(stim_list, language, load, n_repetitions) {
  var next_screen = {type: 'html-keyboard-response',
                     stimulus: "<p>Let's have another look at those words.</p>\
                                <p>Remember you'll be tested on all the words at the end!</p>",
                     choices: jsPsych.NO_KEYS,
                     trial_duration: 5000}

  var training_block = []
  for (var i = 0; i < n_repetitions; i++) {
    var training_trials = []
    for (var j = 0; j < stim_list.length; j++) {
      if (j % 2 == 0) {var response_type = 'retype'} else {var response_type = 'array_selection'}
        training_trials.push(make_training_trial(stim_list[j],
                                                 language.get_word(stim_dict.get_meaning(stim_list[j])[0], // shape
                                                                   stim_dict.get_meaning(stim_list[j])[1]), // fill
                                                 load,
                                                 response_type))
    }
    training_block.push(jsPsych.randomization.shuffle(training_trials), next_screen)
  }

  return training_block.flat().slice(0,-1)
}

// Change the final argument here if you want to do more/fewer rounds of training
var training_block = make_training_block(stim_list, language, load, 6)

var random_stim = jsPsych.randomization.sampleWithoutReplacement(stim_list, 1)[0]
var practice_round = make_training_trial(random_stim,
                                         language.get_word(stim_dict.get_meaning(random_stim)[0], // shape
                                                           stim_dict.get_meaning(random_stim)[1]), // fill
                                         load,
                                         jsPsych.randomization.sampleWithoutReplacement(['retype', 'array_selection'], 1)[0])


/*** TESTING PHASE ***/

function make_testing_trial(stim) {
  var trial = {type: 'survey-html-form',
               html: "<img src=" + stim + " width=" + stim_width + "px height=" + stim_height + "px><br> \
                      <p style='font-size: 30px'>What is this object called?<br> \
                        <input required name='word' type='text'/></p>",
               autofocus: 'word',
               data: {block: 'testing',
                      response_type: 'NA',
                      stimulus: normalize_filename(stim),
                      shape: stim_dict.get_meaning(stim)[0],
                      fill_pattern: stim_dict.get_meaning(stim)[1],
                      target_word: language.get_word(stim_dict.get_meaning(stim)[0], // shape
                                                     stim_dict.get_meaning(stim)[1]), // fill
                      image_choices: ['NA', 'NA', 'NA'],
                      image_chosen: 'NA',
                      correct_image: 'NA',
                      target_sequence: 'NA',
                      sequence_typed: 'NA',
                      digits_correct: 'NA'},
              on_finish: function(data) {
                data.word_typed = normalize_word(JSON.parse(data.responses).word)
                save_trial_data(data)
              }
             }
  return trial
}

var testing_trials = []
for (var i = 0; i < stim_list.length; i++) {
  testing_trials.push(make_testing_trial(stim_list[i]))
}
var testing_trials = jsPsych.randomization.shuffle(testing_trials)


/*** DEBRIEF QUESTIONNAIRE ***/

var debrief_questionnaire = {
  type: 'survey-html-form',
  preamble: "<h2>Before you go</h2>\
  <p style='text-align:left'>Please answer a few final questions.</p>",
  html: "<p style='text-align:left'>Did you take any written notes to help you remember the words?<br> \
           <input required style='margin-left: 5%' type='radio' name='notes' value='yes'>yes<br>\
           <input style='margin-left: 5%' type='radio' name='notes' value='no'>no<br></p> \
         <p style='text-align:left'>Do you have any comments about our experiment? (optional)<br> \
           <textarea style='text-align:left' name='comments'rows='10' cols='60'></textarea></p>",
  button_label: 'Submit',
  on_finish: function(data) {save_debrief_data(data)}
}


/*** INSTRUCTIONS & START/FINISH SCREENS ***/

var consent_screen = {
  type: 'html-button-response',
  stimulus: "<h2>Welcome!</h2> \
  <p style='text-align:left'>This is an experiment about learning a new language. It will take up to 20 minutes to complete and you will be paid &#163;2.50 for your time.</p> \
  <p style='text-align:left'>It is being conducted by Aislinn Keogh, supervised by Professor Simon Kirby, at the University of Edinburgh, and has been \
  approved by the PPLS Ethics Committee (ref 319-2021/1).</p> \
  <p style='text-align:left'>Please <a href='information_sheet.pdf' target='_blank'>click here</a> to read an \
  information sheet (PDF) about the study.</p> \
  <p style='text-align:left'>Clicking the button below indicates that:</p> \
  <ul style='text-align:left'>\
    <li>you are a native speaker of English, at least 18 years old and with no known language or memory disorders</li> \
    <li>you have read the information sheet</li> \
    <li>you agree to participate in this study</li> \
    <li>you confirm that you have read and understood how your data will be stored and used</li> \
    <li>you understand that you have the right to terminate this session at any point</li> \
  </ul> \
  <p style='text-align:left'>If you do not agree to all of these, please close this window now.</p>",
  choices: ['Yes, I consent to participate']
}

var initial_instruction_screen = {
  type: 'survey-html-form',
  preamble: "<h2>Instructions</h2>\
  <p>We are investigating how people learn a new language.\
  We will teach you a small part of a new language then test to see how much you have learned.</p>\
  <p>Please do not take written notes! Just do your best: we are interested in what you cannot learn as well as what you can.</p>",
  html: "<p>Please tick the box below to confirm you have read these instructions.</p>\
            <p><input required type='checkbox' name='read'></p>",
  button_label: 'Click here to start the experiment'
}

var training_instruction_screen = {
  type: 'html-button-response',
  stimulus: "<h2>Part one</h2> \
  <p>In this part of the experiment, you will be shown a series of objects with their names in the new language.</p>\
  <p>Your task is to learn the objects' names.</p>\
  <p><b>Pay close attention!</b> Remember you'll be tested on all the words at the end of the experiment.</p>",
  choices: ['Click here to continue']
}

var load_instruction_screen = {
  type: 'html-button-response',
  stimulus: "<p>We are particularly interested in how well people can learn words when the task is difficult.</p> \
             <p>So while you are learning the words, you will also be asked to memorize and recall short sequences of numbers.</p> \
             <p>You will be given feedback throughout on your performance on this task.</p>\
             <p>We understand that high performance in <i>both</i> tasks might be difficult, but we are interested in how well you can \
             achieve this.</p>",
  choices: ['Click here to continue']
}

var practice_instruction_screen = {
  type: 'html-button-response',
  stimulus: "<p>We'll do one practice round first to make sure you understand the task.</p>",
  choices: ['Click here to continue']
}

var ready_to_begin = {
  type: 'html-button-response',
  stimulus: "<p>Click below when you're ready to start the experiment.</p>",
  choices: ['Click here to continue']
}

var testing_instruction_screen = {
  type: 'html-button-response',
  stimulus: "<h2>Part two</h2> \
  <p>In this part of the experiment, you will see all the objects whose names you have just learned.</p>\
  <p>Your task is to provide the name for each object, one at a time.</p>",
  choices: ['Click here to continue']
}

var final_screen = {
  type: 'html-button-response',
  stimulus: "<h2>Finished!</h2>\
  <p>You're all done. Thanks for participating!</p>",
  choices: ['Click here to return to Prolific']
}


/*** TIMELINES ***/

var start_fullscreen = {
  type: 'fullscreen',
  fullscreen_mode: true
}

var stop_fullscreen = {
  type: 'fullscreen',
  fullscreen_mode: false
}

if (allocated_condition['load'] == 'none') {
  var full_timeline = [].concat(consent_screen,
                                start_fullscreen,
                                initial_instruction_screen,
                                training_instruction_screen,
                                practice_instruction_screen,
                                practice_round,
                                ready_to_begin,
                                training_block,
                                testing_instruction_screen,
                                testing_trials,
                                debrief_questionnaire,
                                final_screen,
                                stop_fullscreen)
}
else {
  var full_timeline = [].concat(consent_screen,
                                start_fullscreen,
                                initial_instruction_screen,
                                training_instruction_screen,
                                load_instruction_screen,
                                practice_instruction_screen,
                                practice_round,
                                ready_to_begin,
                                training_block,
                                testing_instruction_screen,
                                testing_trials,
                                debrief_questionnaire,
                                final_screen,
                                stop_fullscreen)
}


/*** DATA SAVING ***/

var participant_id = jsPsych.data.getURLVariable('PROLIFIC_PID')
// var participant_id = jsPsych.randomization.randomID(10)

function save_data(name, data_in){
  var url = 'save_data.php';
  var data_to_send = {filename: name, filedata: data_in};
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(data_to_send),
      headers: new Headers({
              'Content-Type': 'application/json'})
  });
}

function save_trial_data(data) {
   var data_to_save = [
       participant_id, allocated_condition['structure'], allocated_condition['load'],
       data.block, data.response_type,
       data.stimulus, data.shape, data.fill_pattern,
       data.target_word, data.word_typed,
       // data.image_choices, data.image_chosen, data.correct_image,
       data.target_sequence, data.sequence_typed, data.digits_correct, data.rt];
   var line = data_to_save.join(',')+"\n";
   save_data(participant_id + '.csv', line);
}

function save_debrief_data(data) {
    var data_to_save = [participant_id,
                        JSON.parse(data.responses).notes,
                        JSON.parse(data.responses).comments];
    var line = data_to_save.join(',')+'\n';
    save_data(participant_id + '_debrief.csv', line);
}

/*** RUN ***/

jsPsych.init({
    preload_images: stim_list,
    timeline: full_timeline,
    show_progress_bar: true,
    on_finish: function(){
      window.location = 'https://app.prolific.co/submissions/complete?cc=747132B9'
    }})
