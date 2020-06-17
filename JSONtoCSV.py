# JSON to CSV
# Reads items as Python list
# At the end puts in pandas dataframe and saves as csv

import json
import time
import pandas as pd

# To unpacks dictionary to Python list
def JSON_dict2python_list(json_dict, start_time, current_Id):
    '''
    TODO Docstring
    '''
    events_length   =   len(json_dict['events']) # number of events this json object has
    list_events = []    # initilise list as empty

    # TODO 'normalise' time
    
    if current_Id != json_dict['turkId']:    # test this bad boi
        current_Id = json_dict['turkId']
        start_time = json_dict['events'][0]['time'] # Assign start_time to first record in the list of dictionaries

    for i in range((events_length)):

        old_time = json_dict['events'][i]['time']
        debug_curr_time = json_dict['events'][i]['time'] - start_time 
        debug_time = (debug_curr_time) / 1000   # For easier debugging

        values =    [
                    json_dict['events'][i]['button'],
                    json_dict['events'][i]['event_type'],
                    json_dict['events'][i]['target'],
                    debug_time, #(json_dict['events'][i]['time'] - start_time) / 1000 ,    # normalized time assume in ms
                    json_dict['events'][i]['x'],
                    json_dict['events'][i]['y'],
                    json_dict['step'],
                    json_dict['turkId']                    
                    ]

        list_events.append(values)

    return list_events, start_time, current_Id

# Unpacks list of dictionaries to Python list
def list_JSON_dicts2string_np(list_json_dicts):
    '''
    TODO Docstring
    '''
    length = len(list_json_dicts)
    mouse_events_array = []

    current_Id = list_json_dicts[0]['turkId']

    #if current_Id == list_json_dicts[0]['turkId']:
    #    current_Id = list_json_dicts[0]['turkId']

    ########################################################################
    ######## Lets assume any new user would be in its own list_json_dicts so:
    ######## Do any checking of userIds and start times here.

    # Normalize time
    start_time = list_json_dicts[0]['events'][0]['time']    # TODO fix!! Can have negative times for some reason.

    for i in range(length): # SEe what i is on error
        events_items, new_start_time, new_current_Id = JSON_dict2python_list(list_json_dicts[i], start_time, current_Id)   # Indexes will be continuous

        
        if current_Id != new_current_Id:
            current_Id = new_current_Id
            start_time = new_start_time

        # events_items is [event1, event2]
        # Loop ensures events are both appended as separate items
        for item in events_items:
            mouse_events_array.append(item)

        # Print update every 10,000 records
        if (i % 10000 == 0):
            print('{} / {} completed'.format(i+1, length), list_json_dicts[i]['turkId'])

    return mouse_events_array


def convert_json_to_csv(json_filename, csv_filename):
    '''
    Input json_filename must end in .json
    Input csv_filename must end in .csv

    Function both saves a csv representation of the JSON data, 
     and returns a pandas dataframe. 
    '''
    debug_start_time = time.time()

    with open(json_filename) as json_file:
        mouse_events = json.load(json_file)

    mouse_events_list = list_JSON_dicts2string_np(mouse_events)
    mouse_events_dataframe = pd.DataFrame(mouse_events_list).rename(columns={0 : "button",
                                                                         1 : "event_type",
                                                                         2 : "target",
                                                                         3 : "time",
                                                                         4 : "x", 
                                                                         5 : "y", 
                                                                         6 : "step",
                                                                         7 : "turkId"})

    mouse_events_dataframe.to_csv( csv_filename )
    debug_end_time = time.time()
    print("Time taken: {} s".format(int(debug_end_time - debug_start_time)))	

    return mouse_events_dataframe

################# Test ###################
#convert_json_to_csv('mouse_events.json')
