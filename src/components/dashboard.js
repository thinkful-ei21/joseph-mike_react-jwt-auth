import React from 'react';
import {connect} from 'react-redux';
import requiresLogin from './requires-login';
import {fetchProtectedData} from '../actions/protected-data';
import {clearAuth, refreshAuthToken} from '../actions/auth';
import {clearAuthToken} from '../local-storage';

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          warningTime: 1000 * 60 * 14,
          signoutTime: 1000 * 60 * 15,
          warningMessage: false
        };
    }


    componentDidMount() {
        this.props.dispatch(fetchProtectedData());

        this.events = [
            'load',
            'mousemove',
            'mousedown',
            'click',
            'scroll',
            'keypress'
        ];

        for (let i in this.events) {
            window.addEventListener(this.events[i], this.resetIdleTimer);
        }
    
        this.setIdleTimer();
    }

    componentWillUnmount() {
        this.clearTimeoutFunc();
        for (let i in this.events) {
            window.removeEventListener(this.events[i], this.resetIdleTimer);
        }
    }

    clearTimeoutFunc = () => {
        if (this.warnTimeout) clearTimeout(this.warnTimeout);
  
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
    };
  
    setIdleTimer = () => {
        this.warnTimeout = setTimeout(this.warn, this.state.warningTime);
        this.logoutTimeout = setTimeout(this.logout, this.state.signoutTime);
    };
  
    resetIdleTimer = () => {
        this.clearTimeoutFunc();
        this.setIdleTimer();
    };
  
    warn = () => {
        this.setState({
            warningMessage: true
            })
        };
  
    logout = () => {
        this.props.dispatch(clearAuth());
        clearAuthToken();
      };

    stillHere = () => {
          this.setState({
              warningMessage: false
          })
      }

    render() {
        if (this.state.warningMessage) {
            return (
                <div className="dashboard">
                    <div>
                        <div className="dashboard-username">
                            Username: {this.props.username}
                        </div>
                        <div className="dashboard-name">Name: {this.props.name}</div>
                        <div className="dashboard-protected-data">
                            Protected data: {this.props.protectedData}
                        </div>
                    </div>

                    <div className="dashboard-warning-message">
                        <p>Are you still there? You will be signed out in 1 minute due to inactivity.</p>
                        <button onClick={() => this.stillHere()}>I'm here!</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="dashboard">
                    <div className="dashboard-username">
                        Username: {this.props.username}
                    </div>
                    <div className="dashboard-name">Name: {this.props.name}</div>
                    <div className="dashboard-protected-data">
                        Protected data: {this.props.protectedData}
                    </div>
                </div>
            );
        }   
    }
}

const mapStateToProps = state => {
    const {currentUser} = state.auth;
    return {
        timeout: false,
        username: state.auth.currentUser.username,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        protectedData: state.protectedData.data
    };
};

export default requiresLogin()(connect(mapStateToProps)(Dashboard));
