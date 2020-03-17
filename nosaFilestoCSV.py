import os
import json
import pandas as pd
#from JSONtoCSV import list_JSON_dicts2string_np # Don't use as need to read differently so TurkIds arnt all 0


# To unpacks dictionary to Python list
def lab_JSON_dict2python_list(json_dict, turk_id):
    '''
    TODO Docstring
    '''
    events_length   =   len(json_dict['events']) # number of events this json object has
    list_events = []    # initilise list as empty

    # TODO 'normalise' time

    for i in range((events_length)):

        values =    [
                    json_dict['events'][i]['button'],
                    json_dict['events'][i]['event_type'],
                    json_dict['events'][i]['target'],
                    json_dict['events'][i]['time'],
                    json_dict['events'][i]['x'],
                    json_dict['events'][i]['y'],
                    json_dict['step'],
                    turk_id #json_dict['turkId'] Replaced line to assign each user a unique ID I've created myself                     
                    ]

        list_events.append(values)

    return list_events


# Unpacks list of dictionaries to Python list
def lab_list_JSON_dicts2string_np(list_json_dicts, turk_id):
    '''
    TODO Docstring
    '''
    length = len(list_json_dicts)
    mouse_events_array = []

    for i in range(length):
        events_items = lab_JSON_dict2python_list(list_json_dicts[i], turk_id)   # Indexes will be continuous
        # events_items is [event1, event2]
        # Loop ensures events are both appended as seperate items
        for item in events_items:
            mouse_events_array.append(item)

        print('{} / {} completed'.format(i+1, length))

    return mouse_events_array


#################################################################################
# I think each new file is a new users data.

all_mouseevents = []
directory_name = 'No-sa-Lab-Study-data'
turk_id = 0 # Should be user ID but trying to be consistant with other file.

for file in os.listdir(directory_name):

        turk_id = turk_id + 1 # increment turk id for each new file

        with open(directory_name +'\\'+ file) as json_file:
                dict = json.load(json_file)

        if dict['mouseevents-events'] == None:
                print('################# {} contained no mouse data #################'.format(file))
                continue

        list_dicts = json.loads(dict['mouseevents-events'])

        mouseevents_list = lab_list_JSON_dicts2string_np(list_dicts, turk_id)        #Use my prebuilt function

        all_mouseevents.extend(mouseevents_list)

dataframe = pd.DataFrame(all_mouseevents).rename(columns={  0 : "button",
                                                            1 : "event_type",
                                                            2 : "target",
                                                            3 : "time",
                                                            4 : "x", 
                                                            5 : "y", 
                                                            6 : "step",
                                                            7 : "turkId"})

dataframe.to_csv('Lab-Data-NoSa.csv')