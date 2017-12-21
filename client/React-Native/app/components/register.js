/*
BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).

This file is part of BigBlueTutor.

BigBlueTutor is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BigBlueTutor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with BigBlueTutor.  If not, see <http://www.gnu.org/licenses/>.
*/
import React, { Component } from 'react';
import {
  Button,
  Modal,
  TextInput,
  TouchableHighlight,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Config from 'react-native-config';
import PushNotification from 'react-native-push-notification';

styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#3F89E2'
  }
})

export default class Register extends Component<{}> {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: true
    }
  }

  setModalVisible(visible) {
    this.state.modalVisible = visible;
  }

  register() {
    this.props.ds.login({idToken: this.props.idToken, username: this.state.username, platform: Platform.OS}, (success,data) => {
      if(success) {
        this.state.username = data.username;
        this.state.profileRecord = this.props.ds.record.getRecord('profile/'+ this.state.username);
        this.state.dataRecord = this.props.ds.record.getRecord('data');
        this.state.profileRecord.whenReady(() => {
          this.state.dataRecord.whenReady(() => {
            if (!this.state.profileRecord.get("onboardingComplete")) {
              Actions.reset('onboard', {ds: this.props.ds, username: this.state.username, profileRecord: this.state.profileRecord, dataRecord: this.state.dataRecord, configurePush: this.props.configurePush});
            } else {
              var configurePush = this.props.configurePush.bind(this)
              configurePush()
              Actions.reset('drawer', {ds: this.props.ds, username: this.state.username, profileRecord: this.state.profileRecord, dataRecord: this.state.dataRecord, configurePush: this.props.configurePush});
              Actions.home({ds: this.props.ds, username: this.state.username, profileRecord: this.state.profileRecord, dataRecord: this.state.dataRecord, configurePush: this.props.configurePush});
            }
          })
        })
      }
    })
  }

  render() {
    return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {Actions.pop()}}
          >
         <View style={ styles.container } >
          <View>
            <View
              style={{ marginLeft: 20 }}
            >
              <Text>Please Enter a username</Text>
            </View>
            <TextInput
              underlineColorAndroid='transparent'
              style={{ marginHorizontal: 20, backgroundColor: '#27d' }}
              onChangeText={(text) => this.state.username=text}
              value={this.state.username}
            />
            <View
              style={{flexDirection: 'row', justifyContent:'center'}}
            >
              <TouchableOpacity
                onPress={this.register.bind(this)}
              >
                <Text
                  style={{ fontSize: 30, color: '#fff'}}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
         </View>
        </Modal>
    );
  }
}
