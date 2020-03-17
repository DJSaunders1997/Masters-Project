# JSON to CSV
# Reads items as Python list
# At the end puts in pandas dataframe and saves as csv

import json
import time
import pandas as pd

# To unpacks dictionary to Python list
def JSON_dict2python_list(json_dict, start_time):
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
                    (json_dict['events'][i]['time'] - start_time) / 1000 ,    # normalized time assume in ms
                    json_dict['events'][i]['x'],
                    json_dict['events'][i]['y'],
                    json_dict['step'],
                    json_dict['turkId']                    
                    ]

        list_events.append(values)

    return list_events

# Unpacks list of dictionaries to Python list
def list_JSON_dicts2string_np(list_json_dicts):
    '''
    TODO Docstring
    '''
    length = len(list_json_dicts)
    mouse_events_array = []

    # Normalize time
    start_time = list_json_dicts[0]['events'][0]['time']

    for i in range(length):
        events_items = JSON_dict2python_list(list_json_dicts[i], start_time)   # Indexes will be continuous
        # events_items is [event1, event2]
        # Loop ensures events are both appended as seperate items
        for item in events_items:
            mouse_events_array.append(item)

        print('{} / {} completed'.format(i+1, length))

    return mouse_events_array


def convert_json_to_csv(filename):
    '''
    Filename must end in .json
    '''
    start_time = time.time()

    with open(filename) as json_file:
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

    mouse_events_dataframe.to_csv(filename[:-4] + 'csv')   # Saves to filename without the .json
    end_time = time.time()
    print("Time taken: {} s".format(int(end_time-start_time)))	

################# Run ###################
convert_json_to_csv('mouse_events.json')
