import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import { Block, Checkbox, Link, Text, theme } from "galio-framework";

import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { forwardRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as API from "../api/endpoints"
const axios = require('axios').default;

const { width, height } = Dimensions.get("screen");

class Login extends React.Component { 

  constructor(props){
    super(props)
    this.state = {
      email: null,
      password: null,
      isLoginFailed: false,
      LoadingAPI: false,
      loginButtonText: 'SIGN IN',
      errorMessage: null,
    }
  }

  async checkValidUser(token){
    const validStatusCode = 200;

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    };

    try {
      const response = await axios({
        method: 'POST',
        url: API.CHECK_VALID_TOKEN,
        headers: headers,
      });
      console.log(response.status);
      return response.status === validStatusCode
    } catch (error) {
      return error.response.status === validStatusCode
    }
  }

  getUserFromStore = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      if(user !== null) {
        // value previously stored
        return JSON.parse(user);
      }
    } catch (error) {
      console.log(error);
    }
  }

  saveUserInfo = async (user) => {
    try {
      const userObj = JSON.stringify(user)
      console.log(userObj);
      await AsyncStorage.setItem('user', userObj)
    } catch (e) {
      // saving error
      console.log(e);
    }
  }

  navigationToHome() {
    const {navigation} = this.props
    return navigation.navigate("Home")
  }

  async componentDidMount(){
    console.log("moi vao chay r");
    const user = await this.getUserFromStore();
    const token = user.access_token
    const isValid = await this.checkValidUser(token)
    // console.log(user.access_token);
    console.log("LAST_CHECK");
    console.log(isValid);
    if(isValid){
      this.navigationToHome()
    }
  }

  async login(data) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios({
        method: 'POST',
        url: API.LOGIN,
        headers: headers,
        data,
      });
      console.log(response.status);
      if (response.status === 200) {
        this.setState({ loginButtonText: 'SIGN IN' })
        this.saveUserInfo(response.data)
        this.navigationToHome()
      }
    } catch (error) {
      this.setState({ loginButtonText: 'SIGN IN' })
      console.log(error);
      if (error.response.status === 401 || error.response.status === 422 || error.response.status === 403) {
        this.showErrors('api-error')
        this.setState({ isLoginFailed: true })
        this.setState({ password: '' })
        console.log("dang nhap ko thanh cong")
      }
    }
  }

  showErrors(type){
    switch (type) {
      case 'input-error':
        this.setState({errorMessage :'Please enter your email or password!'})
        break;
      case 'api-error':
        this.setState({errorMessage: 'Email or password are wrong!'})
        break;
     
    }
  }

  prepareLogin() {
    console.log("+==================+");
    const data = {
      email: this.state.email,
      password: this.state.password,
    }

    if (data.email && data.password) {
      this.setState({ loginButtonText: 'PLEASE WAIT...' })
      this.login(data)
    } else {
      this.setState({ isLoginFailed: true })
      this.showErrors('input-error')
    }

  }
  render() {
    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block flex middle>
            <Block style={styles.registerContainer}>
              <Block flex>
                <Block flex={0.17} middle>
                  <Text color="#8898AA" size={25}>
                    SIGN IN
                  </Text>
                </Block>
                <Block flex center>
                  {
                    this.state.isLoginFailed &&
                    <Text style={styles.notification} size={15}>
                      {this.state.errorMessage}
                  </Text>
                  }
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        onChangeText={email => this.setState({ email: email })}
                        borderless
                        placeholder="Email"
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ic_mail_24px"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8}>
                      <Input
                        onChangeText={pwd => this.setState({ password: pwd })}
                        password
                        borderless
                        placeholder="Password"
                        value={this.state.password}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="padlock-unlocked"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                      <Block row style={styles.passwordCheck}>
                        <Text
                          bold
                          size={12}
                          color={argonTheme.COLORS.PRIMARY}
                          style={styles.textRight}
                        // onPress={()=> navigation.navigate('Profile')} //navigate to forgot UI
                        >
                          {" "}
                          Forgot password
                        </Text>
                      </Block>
                    </Block>
                    <Block middle>
                      <Button
                        color="primary" style={styles.createButton} onPress={() => this.prepareLogin(this)}>
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          {this.state.loginButtonText}
                        </Text>
                      </Button>
                    </Block>
                    <Block middle style={styles.moreAboutAccount}>
                      <Text> You don't have account ? </Text>
                      <Text size={18} bold color={argonTheme.COLORS.PRIMARY}>
                        {" "}
                        Signup
                      </Text>
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </Block>
              <Block flex={0.35} middle style={styles.socialConnect}>
                <Text color="#8898AA" size={15}>
                  Or sign in with
                </Text>
                <Block row style={{ marginTop: theme.SIZES.BASE }}>
                  <Button style={{ ...styles.socialButtons, marginRight: 30 }}>
                    <Block row>
                      <Icon
                        name="logo-github"
                        family="Ionicon"
                        size={14}
                        color={"black"}
                        style={{ marginTop: 2, marginRight: 5 }}
                      />
                      <Text style={styles.socialTextButtons}>GITHUB</Text>
                    </Block>
                  </Button>
                  <Button style={styles.socialButtons}>
                    <Block row>
                      <Icon
                        name="logo-google"
                        family="Ionicon"
                        size={14}
                        color={"black"}
                        style={{ marginTop: 2, marginRight: 5 }}
                      />
                      <Text style={styles.socialTextButtons}>GOOGLE</Text>
                    </Block>
                  </Button>
                </Block>
              </Block>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width,
    height: height,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden",
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA",
    paddingTop: 10,
    paddingBottom: 40,
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14,
  },
  inputIcons: {
    marginRight: 12,
  },
  passwordCheck: {
    paddingTop: 25,
    paddingBottom: 15,
    flex: 1,
    height: 30,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  textRight: {
    textAlign: "right",
    height: 15,
  },
  createButton: {
    width: width * 0.5,
    marginTop: 15,
  },
  moreAboutAccount: {
    paddingTop: 35,
  },
  notification: {
    color: 'red',
    fontWeight: 'bold',
    paddingBottom: 20
  }
});

export default Login;
