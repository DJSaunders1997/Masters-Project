# JSON to CSV
# Reads items as Python list
# At the end puts in pandas dataframe and saves as csv

import json
import pandas as pd

# To unpacks dictionary to Python list
def JSON_dict2python_list(json_dict):
    '''
    TODO Docstring
    '''
    events_length   =   len(json_dict['events']) # number of events this json object has
    list_events = []    # initilise list as empty

    for i in range((events_length)):

        values =    [
                    json_dict['events'][i]['button'],
                    json_dict['events'][i]['event_type'],
                    json_dict['events'][i]['target'],
                    json_dict['events'][i]['time'],
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

    for i in range(length):
        events_items = JSON_dict2python_list(list_json_dicts[i])   # Indexes will be continuous
        # events_items is [event1, event2]
        # Loop ensures events are both appended as seperate items
        for item in events_items:
            mouse_events_array.append(item)

        print('{} / {} completed'.format(i+1, length))

    return mouse_events_array