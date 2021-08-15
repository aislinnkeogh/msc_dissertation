# Dissertation

This is a repository for my MSc Dissertation in Linguistics at the University of Edinburgh, submitted August 2021.

-- EXPERIMENT --

The experiment code uses jsPsych version 6.1.0 which can be downloaded from https://github.com/jspsych/jsPsych (please note it will not work with the most recent version of jsPsych!).

To run the experiment, you will need to follow these steps:
  1. Download all the files and save to your server.
  2. Download the jsPsych library to the same area as the experiment files.
  3. In the .php file, change the path on line 5 to the location on your server where you would like data to be saved.
  4. Change the details on the consent screen (starts on line 448 of the .js file).
  5. Change the participant_id variable on line 573 if not running on Prolific.
  6. Change the URL on line 614 of the .js file to wherever you would like to redirect participants when they finish the experiment.
  
-- ANALYSIS --

Data analysis was conducted in an R markdown notebook. A separate file was saved for each participant's main data and debrief questionnaire as part of the experiment. The data saved in this repository has been anonymised and concatenated.
