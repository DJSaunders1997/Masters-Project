import json
import os
import time
import pandas as pd

#from JSONtoCSV import list_JSON_dicts2string_np # Don't use as need to read differently so TurkIds arnt all 0


# To unpacks dictionary to Python list
def lab_JSON_dict2python_list(json_dict, turk_id, start_time, filename):
    '''
    TODO Docstring
    '''
    events_length   =   len(json_dict['events']) # number of events this json object has
    list_events = []    # initialise list as empty

    for i in range((events_length)):

        values =    [
                    json_dict['events'][i]['button'],
                    json_dict['events'][i]['event_type'],
                    json_dict['events'][i]['target'],
                    (json_dict['events'][i]['time'] - start_time) / 1000 ,    # normalized time assume in ms
                    json_dict['events'][i]['x'],
                    json_dict['events'][i]['y'],
                    json_dict['step'],
                    turk_id, #json_dict['turkId'] Replaced line to assign each user a unique ID I've created myself
                    filename                     
                    ]

        list_events.append(values)

    return list_events


# Unpacks list of dictionaries to Python list
def lab_list_JSON_dicts2string_np(list_json_dicts, turk_id, filename):
    '''
    TODO Docstring
    '''
    length = len(list_json_dicts)
    mouse_events_array = []

    # Normalize time
    start_time = list_json_dicts[0]['events'][0]['time']    # Get first dictionary, first events data

    for i in range(length):
        events_items = lab_JSON_dict2python_list(list_json_dicts[i], turk_id, start_time, filename)   # Indexes will be continuous
        # events_items is [event1, event2]
        # Loop ensures events are both appended as separate items
        for item in events_items:
            mouse_events_array.append(item)

        # Print update every 200 records
        if (i % 200 == 0):
            print('{} / {} completed'.format(i+1, length))

    return mouse_events_array

def lab_convert_json_to_csv(data_directory, csv_filename):
    '''
    Input data_directory should be the location of the lab study data
    Input csv_filename must end in .csv

    Function both saves a csv representation of the JSON data, 
     and returns a pandas dataframe. 
    '''
    debug_start_time = time.time()
    # I think each new file is a new users data.

    all_mouseevents = []
    i = 0

    for file in os.listdir(data_directory):

            with open(data_directory +'\\'+ file) as json_file:
                try:
                    dict = json.load(json_file) #Line causing errors? TODO dive into tomorrow. Because some of the files aren't in correct format?
                except:
                    print('Error loading in file {}. Is the file supposed to be in the directory?'.format(file))
                    continue

            if dict['mouseevents-events'] == None:
                print('################# {} contained no mouse data #################'.format(file))
                continue
            else:
                print('Opening File {}'.format(file))

            i = i + 1
            turk_id = 'ID' + str(i) # increment turk id for each valid file

            list_dicts = json.loads(dict['mouseevents-events'])

            mouseevents_list = lab_list_JSON_dicts2string_np(list_dicts, turk_id, file)        #Use my prebuilt function

            all_mouseevents.extend(mouseevents_list)

    dataframe = pd.DataFrame(all_mouseevents).rename(columns={  0 : "button",
                                                                1 : "event_type",
                                                                2 : "target",
                                                                3 : "time",
                                                                4 : "x", 
                                                                5 : "y", 
                                                                6 : "step",
                                                                7 : "turkId",
                                                                8 : "file"})

    dataframe.to_csv( csv_filename )
    debug_end_time = time.time()
    print("Time taken: {} s".format(int(debug_end_time - debug_start_time)))	

    return dataframe
