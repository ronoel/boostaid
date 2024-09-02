# BoostAid

**Empowering Projects and Communities through Decentralized Crowdfunding**

BoostAid is a decentralized crowdfunding platform leveraging blockchain technology and NFTs to create a transparent, secure, and engaging environment for raising funds. This project is built on the Stacks (STX) blockchain and consists of two main components: smart contracts and a user experience (UX) interface. 

## Project Structure

The BoostAid project is organized into the following directories:

- **boostaid-smart-contract**: This folder contains the smart contracts and associated tests. These contracts manage the core functionalities of the BoostAid platform, such as fundraising mechanisms, NFT management, and reward distribution.

- **boostaid-ux**: This folder contains the UX project, built with Angular, which provides the front-end interface for interacting with the BoostAid platform. Users can create campaigns, contribute to projects, and manage their NFTs through this interface.

## Features

### Decentralized Crowdfunding
BoostAid addresses common challenges in traditional crowdfunding by providing:
- **Transparency**: All transactions and project details are recorded on the Stacks blockchain, ensuring verifiable and immutable records.
- **Credibility**: Project creators purchase "Fundraiser NFTs" to verify their legitimacy and commitment to their projects.
- **Community Engagement**: Supporters receive "Supporter NFTs" as tokens of appreciation, fostering a sense of community and ownership.
- **Influencer Marketing**: "Promoter NFTs" enable influencers to promote campaigns, earn commissions, and gain recognition within the community.

### User Roles
BoostAid supports multiple user roles, each with distinct capabilities:
- **Creators**: Initiate fundraising campaigns, engage with supporters, and utilize various fundraising tools.
- **Supporters**: Contribute to projects and receive NFTs as recognition, potentially earning additional rewards.
- **Influencers**: Promote projects through unique referral links, earning commissions and community recognition.

### NFT Ecosystem
- **Fundraiser NFT**: Required for creators to launch campaigns, ensuring quality and legitimacy.
- **Supporter NFT**: Awarded to supporters as proof of contribution and for future rewards.
- **Ranked Promoter NFT**: Each influencer receives a single Promoter NFT, ranked based on their promotional performance.

### DAO and Governance
BoostAid will transition to a Decentralized Autonomous Organization (DAO) model, enabling community governance through BoostAid DAO tokens. Token holders will have voting rights on platform tax rates, commission structures, new features, and platform improvements.

## Technology

BoostAid is powered by the [Stacks blockchain](https://www.stacks.co/), ensuring secure, transparent, and decentralized management of digital assets. The platform uses smart contracts to automate processes and NFTs to represent ownership, verify credentials, and provide unique rewards.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) and npm
- [Angular CLI](https://angular.io/cli)
- [Clarinet](https://github.com/hirosystems/clarinet) for smart contract development and testing on Stacks.

### Installation

1. Clone the repository:


2. Navigate to the `boostaid-smart-contract` directory and install dependencies:
    ```bash
    cd boostaid-smart-contract
    npm install
    ```

3. Navigate to the `boostaid-ux` directory and install dependencies:
    ```bash
    cd ../boostaid-ux
    npm install
    ```

### Running the Project

#### Smart Contracts
To run the tests for the smart contracts:
```bash
cd boostaid-smart-contract
npm test
```

#### UX

To serve the UX application locally:

```bash
cd ../boostaid-ux
ng serve
```

Then open your browser and navigate to http://localhost:4200/.
Contributing

Contributions are welcome! Please fork the repository, create a new branch for your feature or bugfix, and submit a pull request. Be sure to follow the coding standards and write tests for your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.


### Key Sections Explained:

- **Project Structure**: Clearly defines the contents of the main directories.
- **Features**: Summarizes what makes BoostAid unique, focusing on its transparency, credibility, community engagement, and the role of NFTs.
- **Technology**: Provides an overview of the Stacks blockchain's role in the project.
- **Getting Started**: Offers a step-by-step guide for setting up the project locally.
- **Contributing**: Encourages community involvement and outlines how to contribute.
- **License and Contact**: Standard sections for legal and communication purposes.
