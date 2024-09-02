import { Injectable, signal } from '@angular/core';
import { AppConfig, UserData, UserSession } from '@stacks/connect';
import { showConnect } from '@stacks/connect';
import { StacksDevnet, StacksTestnet, StacksMainnet } from '@stacks/network';
import { environment } from './../../../environments/environment';

const appConfig = new AppConfig(['store_write', 'publish_data']);

const myAppName = 'Boostaid'; // shown in wallet pop-up
const myAppIcon = 'https://boostaid.net/images/logo/boostaid-logo.png'; // shown in wallet pop-up

/**
 * Service responsible for managing the user's wallet and authentication status.
 */
@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private readonly userSession = new UserSession({ appConfig });;

  private readonly isLoggedInSignal = signal(false);
  private readonly network =
    environment.network === 'mainnet'
      ? new StacksMainnet()
      : environment.network === 'testnet'
        ? new StacksTestnet()
        : new StacksDevnet();

  constructor() {
    this.checkAuth();
    console.log('Wallet Service environment', environment.network);
  }

  /**
   * Checks if the user is authenticated and updates the `isLoggedInSignal` accordingly.
   */
  private checkAuth() {
    console.log('Checking Auth');
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      console.log('User Data:', userData);
      this.isLoggedInSignal.set(true);

      

    } else {
      console.log('User not signed in');
      this.isLoggedInSignal.set(false);
    }
  }

  /**
   * Initiates the sign-in process for the user.
   * If the user is already signed in, it logs a message and returns.
   * If the user is not signed in, it shows a connect pop-up and updates the `isLoggedInSignal` when finished.
   */
  public signIn() {
    if (this.isLoggedInSignal()) {
      console.log('User already signed in');
      return;
    }
    showConnect({
      appDetails: {
        name: myAppName,
        icon: myAppIcon,
      },
      redirectTo: '/',
      onFinish: () => {
        console.log('User finished auth');
        this.isLoggedInSignal.set(true);
      },
      onCancel: () => {
        console.log('User cancelled'); // WHEN user cancels/closes pop-up
      }
    });
  }

  /**
   * Signs out the user if they are signed in.
   * If the user is not signed in, it logs a message and returns.
   */
  public signOut() {
    if (!this.isLoggedInSignal()) {
      console.log('User not signed in');
      return;
    }
    this.userSession.signUserOut();
    this.isLoggedInSignal.set(false);
  }

  /**
   * Checks if the user is currently signed in.
   * @returns `true` if the user is signed in, `false` otherwise.
   */
  public isLoggedIn() {
    return this.isLoggedInSignal();
  }

  /**
   * Retrieves the user data of the currently signed-in user.
   * @returns The user data.
   */
  public getUserData(): UserData {
    return this.userSession.loadUserData();
  }

  /**
   * Retrieves the identity address of the currently signed-in user.
   * @returns The identity address.
   */
  public getIdentityAddress() {
    return this.getUserData().identityAddress;
  }

  public getPublicKey() {
    return this.userSession.generateAndStoreTransitKey();
  }

  /**
   * Retrieves the STX address of the currently signed-in user.
   * @returns The STX address.
   */
  public getSTXAddress() {
    return environment.network === 'mainnet'
      ? this.getUserData().profile.stxAddress.mainnet
      : this.getUserData().profile.stxAddress.testnet;
  }

  public getNetwork() {
    return this.network;
  }

  public getApiUrl() {
    return this.network.coreApiUrl;
  }
}
