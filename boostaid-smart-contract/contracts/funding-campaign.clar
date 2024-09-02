;; title: funding-campaign
;; version:
;; summary: This smart contract is designed for managing funding campaigns within the platform. It allows users to create campaigns, pledge funds, and claim proceeds or refunds.
;; description:
(define-data-var promoter-comission uint u6) ;; 6% of the bid amount to be paid to the promoter
(define-data-var claim-period-owner uint u2016) ;; Define the number of blocks in a period for claiming funds after campaign ends
(define-data-var claim-period-backer uint u4032)    ;; Define the period after which backers can claim their funds if not claimed by the owner

(define-map campaigns uint {
    owner: uint,            ;; The Fundraiser NFT id of the owner of the campaign
    metadata: (string-ascii 100),   ;; The metadata of the campaign (e.g. title, description, image, X link)
    meta-type: uint,            ;; The type of metadata
    goal-min: uint,              ;; The minimum goal amount for the campaign to be considered successful
    goal-main: uint,             ;; The main goal amount for the campaign
    end-block: uint,            ;; The block height at which the campaign ends
    pledged-amount: uint,        ;; The total amount pledged to the campaign
    commission-amount: uint,     ;; The total amount of commission earned by promoters
    refunded-amount: uint,       ;; The total amount refunded to backers
    claimmed: bool,               ;; Indicates whether the owner has claimed the funds
    treasury-claimed: bool       ;; New field to indicate if the treasury has claimed the funds
})

(define-map backers {
        campaign: uint, 
        backer: principal
    }
    { 
        amount: uint,    ;; The sum of all bids placed by the bidder
        refunded: bool    ;; Indicates whether the backer has been refunded
    }
)

(define-map promoters {
        campaign: uint, 
        promoter: uint
    }
    { 
        commission: uint,    ;; The commission earned by the promoter
        claimmed: bool      ;; Indicates whether the promoter has claimed the commission
    }
)

(define-data-var next-campaign-id uint u0) ;; Tracks the next available campaign ID

;;(define-map fundraiser-owners principal uint) ;; Maps fundraiser NFT owners to their NFT IDs

;; Error codes
(define-constant ERR-PERMISSION-DENIED (err u1600))
(define-constant ERR-NOT-TOKEN-OWNER (err u1601))
(define-constant ERR-NOT-OWNER (err u1602))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u1603))
(define-constant ERR-CAMPAIGN-ALREADY-ENDED (err u1604))
(define-constant ERR-CAMPAIGN-NOT-ENDED (err u1605))
(define-constant ERR-CAMPAIGN-GOAL-NOT-MET (err u1606))
(define-constant ERR-CAMPAIGN-GOAL-MET (err u1607))
(define-constant ERR-NOT-PROMOTER (err u1608))
(define-constant ERR-NOT-BACKER (err u1609))
(define-constant ERR-NO-FUNDS-TO-CLAIM (err u1610))
(define-constant ERR-PRECONDITION-FAILED (err u1611))
(define-constant ERR-CLAIM-PERIOD-EXPIRED (err u1612))

;; --- Contract managers ---
(define-map contract-managers principal bool)
(map-set contract-managers tx-sender true)

(define-read-only (is-contract-manager)

	(default-to false (map-get? contract-managers tx-sender)))

(define-public (add-contract-manager (contract principal))
    (begin 
        (asserts! (is-contract-manager) ERR-PERMISSION-DENIED)
        (map-set contract-managers contract true)
        (ok true)
    ))

(define-public (remove-contract-manager (contract principal))
    (begin 
        (asserts! (is-contract-manager) ERR-PERMISSION-DENIED)
        (map-delete contract-managers contract)
        (ok true)
    ))

;; --- Owner Functions ---
(define-public (create-campaign  (m-type uint) (m-data (string-ascii 100)) (goal-min uint) (goal-main uint) (end-block uint) (owner-token-id uint))
    (begin 
        (asserts! (> goal-main goal-min) ERR-PRECONDITION-FAILED)
        (asserts! (> end-block block-height) ERR-PRECONDITION-FAILED)
        (asserts! (is-fundraiser-owner owner-token-id) ERR-NOT-TOKEN-OWNER)
        (try! (contract-call? .treasury pay-tax u6))
        (let ((campaign-id (generate-campaign-id)))
            (map-set campaigns campaign-id {
                owner: owner-token-id,
                metadata: m-data,
                meta-type: m-type,
                goal-min: goal-min,
                goal-main: goal-main,
                end-block: end-block,
                pledged-amount: u0,
                commission-amount: u0,
                refunded-amount: u0,
                claimmed: false,
                treasury-claimed: false
            })
        (ok campaign-id))
    )
)

(define-public (claim-funds (campaign-id uint) (token-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND))
            (amount (- (get pledged-amount campaign) (get commission-amount campaign)))
            (deadline-claim-owner (+ (get end-block campaign) (var-get claim-period-owner)))
        )
        (asserts! (is-fundraiser-owner token-id) ERR-NOT-OWNER)
        (asserts! (not (get claimmed campaign)) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (> block-height (get end-block campaign)) ERR-CAMPAIGN-NOT-ENDED)
        (asserts! (<= block-height deadline-claim-owner) ERR-CLAIM-PERIOD-EXPIRED)
        (asserts! (>= (get pledged-amount campaign) (get goal-min campaign)) ERR-CAMPAIGN-GOAL-NOT-MET)
        (try! (as-contract (contract-call? .treasury withdraw-deposit-fund amount tx-sender u2)))
        (map-set campaigns campaign-id (merge campaign { claimmed: true }))
    (ok true)))

;; --- Backer Functions ---
(define-public (pledge (campaign-id uint) (amount uint) (promoter-token uint))
    (let (
            (campaign (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND))
            (backer (get-backer campaign-id tx-sender))
            (commission (/ (* (var-get promoter-comission) amount) u100))
            (promoter (get-promoter campaign-id promoter-token))
        )
        (asserts! (< block-height (get end-block campaign)) ERR-CAMPAIGN-ALREADY-ENDED)
        (map-set campaigns campaign-id 
            (merge campaign {
                pledged-amount: (+ (get pledged-amount campaign) amount),
                commission-amount: (+ (get commission-amount campaign) commission)
            }))
        (map-set backers { campaign: campaign-id, backer: tx-sender }
            (merge backer {
                amount: (+ (get amount backer) amount)
            }))
        (map-set promoters { campaign: campaign-id, promoter: promoter-token }
            (merge promoter {
                commission: (+ (get commission promoter) commission)
            }))
        (try! (contract-call? .treasury deposit-fund amount))   ;; valor total a ir para o fundo    
    (ok true)))

(define-public (claim-refund (campaign-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND))
            (backer (get-backer campaign-id tx-sender))
            (deadline-claim-owner (+ (get end-block campaign) (var-get claim-period-owner)))
        )
        (asserts! (not (get claimmed campaign)) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (not (get treasury-claimed campaign)) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (> (get amount backer) u0) ERR-NO-FUNDS-TO-CLAIM)
        (if (< (get pledged-amount campaign) (get goal-min campaign))   
            (asserts! (> block-height (get end-block campaign)) ERR-CAMPAIGN-NOT-ENDED) ;; if the campaign did not reach the minimum goal, the backer can claim the refund
            (asserts! (> block-height deadline-claim-owner) ERR-CLAIM-PERIOD-EXPIRED)   ;; if the campaign reached the minimum goal, the backer can claim the refund after the owner's claim period
        )
        (map-delete backers { campaign: campaign-id, backer: tx-sender })
        (map-set campaigns campaign-id 
            (merge campaign {
                refunded-amount: (+ (get refunded-amount campaign) (get amount backer))
            }))
    (ok true)))

;; --- Promoter Functions ---
(define-public (claim-commission (campaign-id uint) (token-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND))
            (promoter (get-promoter campaign-id token-id))
        )
        (asserts! (is-promoter-owner token-id) ERR-NOT-PROMOTER)
        (asserts! (get claimmed campaign) ERR-PRECONDITION-FAILED)
        (asserts! (not (get treasury-claimed campaign)) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (> (get commission promoter) u0) ERR-NO-FUNDS-TO-CLAIM)
        (try! (as-contract (contract-call? .treasury withdraw-deposit-fund (get commission promoter) tx-sender u4)))
        (map-set promoters { campaign: campaign-id, promoter: token-id }
            (merge promoter { claimmed: true }))
    (ok true)))

(define-public (claim-funds-to-treasury (campaign-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND))
            (claim-period-expired (+ (get end-block campaign) (+ (var-get claim-period-owner) (var-get claim-period-backer))))
            (amount (- (get pledged-amount campaign) (get refunded-amount campaign)))
        )
        (asserts! (is-contract-manager) ERR-PERMISSION-DENIED)
        (asserts! (not (get claimmed campaign)) ERR-PRECONDITION-FAILED)
        (asserts! (not (get treasury-claimed campaign)) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (<= amount u0) ERR-NO-FUNDS-TO-CLAIM)
        (asserts! (> block-height claim-period-expired) ERR-CLAIM-PERIOD-EXPIRED)
        (try! (as-contract (contract-call? .treasury withdraw-deposit-fund (get pledged-amount campaign) tx-sender u3)))
        (map-set campaigns campaign-id 
            (merge campaign { treasury-claimed: true }))
        (ok true)
    )
)

(define-read-only (is-fundraiser-owner (token-id uint))
    (let (
        (result (unwrap-panic (contract-call? .fundraiser-nft get-owner token-id)))
    )
        (and (is-some result)
            (is-eq tx-sender (unwrap-panic result))
        )
    )
)

(define-read-only (is-promoter-owner (token-id uint))
    (let (
        (result (unwrap-panic (contract-call? .promoter-nft get-owner token-id)))
    )
        (and (is-some result)
            (is-eq tx-sender (unwrap-panic result))
        )
    )
)

;; Return last campaign-id
(define-read-only (get-last-campaign-id)
    (- (var-get next-campaign-id) u1))

;; Return auction by ID
(define-read-only (get-campaign (campaign-id uint))
    (ok (unwrap! (map-get? campaigns campaign-id) ERR-CAMPAIGN-NOT-FOUND)))

;; Return a backer for a campaign, if not found return default with amount 0
(define-read-only (get-backer (campaign-id uint) (backer principal))
    (default-to { amount: u0, refunded: false } (map-get? backers { campaign: campaign-id, backer: backer }))
)

;; Return a promoter for a campaign, if not found return default with commission 0
(define-read-only (get-promoter (campaign-id uint) (promoter uint))
    (default-to { commission: u0, claimmed: false } (map-get? promoters { campaign: campaign-id, promoter: promoter }))
)

(define-private (generate-campaign-id)
    (let ((campaign-id (var-get next-campaign-id)))
        (var-set next-campaign-id (+ campaign-id u1))
        campaign-id))