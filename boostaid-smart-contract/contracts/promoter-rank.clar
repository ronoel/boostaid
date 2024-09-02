
;; title: promoter-rank
;; version:
;; summary:
;; description:
(define-map contract-managers principal bool)
(map-set contract-managers .auction-store true)
(map-set contract-managers tx-sender true)

(define-constant cycle-duration u2016)
(define-constant start-block block-height)

;; Store the score by promoter for each cycle
(define-map reward-cycle {nft-id: uint, cycle: uint} {reward: uint, claimmed: bool})

;; store the control of rank in the cycle
(define-map ctrl-rank-cycle {cycle: uint}
    {
		n1: uint, s1: uint,
		n2: uint, s2: uint,
		n3: uint, s3: uint
	}
)

(define-constant ERR-PERMISSION-DENIED (err u1400))
(define-constant ERR-NOT-TOKEN-OWNER (err u1401))       
(define-constant ERR-PRECONDITION (err u1402))

;; Calculate cycle
(define-read-only (get-current-cycle)
    (/ (- block-height start-block) cycle-duration)
)

;; Get contract-manager permission. Return default false
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

;; Update rank list
(define-private (update-rank (nft-id uint) (cy-score uint))
	(let
		(
            (current-cycle (get-current-cycle))
			(current-rank (default-to {
				n1: u0, s1: u0,
				n2: u0, s2: u0,
				n3: u0, s3: u0
			} (map-get? ctrl-rank-cycle {cycle: current-cycle})))
		)
		(if (> cy-score (get s1 current-rank))  ;; check if top1
			(map-set ctrl-rank-cycle {cycle: current-cycle} {
				n1: nft-id, s1: cy-score,
				n2: (get n1 current-rank), s2: (get s1 current-rank),
				n3: (get n2 current-rank), s3: (get s2 current-rank)
			})
			(if (> cy-score (get s2 current-rank))  ;; check if top2
				(map-set ctrl-rank-cycle {cycle: current-cycle} {
					n1: (get n1 current-rank), s1: (get s1 current-rank),
					n2: nft-id, s2: cy-score,
					n3: (get n2 current-rank), s3: (get s2 current-rank)
				})
				(if (> cy-score (get s3 current-rank))  ;; check if top3
					(map-set ctrl-rank-cycle {cycle: current-cycle} {
						n1: (get n1 current-rank), s1: (get s1 current-rank),
						n2: (get n2 current-rank), s2: (get s2 current-rank),
						n3: nft-id, s3: cy-score
					})
					true
				)
			)
		)
		(ok true)
	)
)

;; Add reward
(define-public (add-reward (nft-id uint) (reward-promoter uint))
    (begin 
        (asserts! (is-contract-manager) ERR-PERMISSION-DENIED)
        (let 
            (
                (current-cycle (get-current-cycle))
                (cy-reward (default-to {reward: u0, claimmed: false} 
                    (map-get? reward-cycle {nft-id: nft-id, cycle: current-cycle} )))
                (total-reward (+ reward-promoter (get reward cy-reward)))
            )
            (map-set reward-cycle {nft-id: nft-id, cycle: current-cycle} {reward: total-reward, claimmed: false})
        (update-rank nft-id total-reward))
        )
)

(define-public (claim-reward (nft-id uint) (cycle uint)) 
    (let
        (
            (owner-nft u1)  ;; recovery the owner of the NFT
            (current-cycle (get-current-cycle))
            (past-cycles (- current-cycle cycle))
			(cy-reward (default-to {reward: u0, claimmed: false} 
				(map-get? reward-cycle {nft-id: nft-id, cycle: cycle} )))
        )
        (asserts! (> current-cycle cycle) ERR-PRECONDITION)  ;; the cycle must be finished to claim the reward
		;; check if the reward has already been claimed or if greater than 0
		(asserts! (and (not (get claimmed cy-reward)) (> (get reward cy-reward) u0)) ERR-PRECONDITION) 
		(asserts! (if (< past-cycles u4)         	;; if past-cycles is greater than 4, allow the contract owner to claim the reward
						(isPromoterOwner nft-id)	;; check permission, verify if the NFT belongs to the sender
						(or 	;; after 4 cycles, the contract owner can claim the reward
							(is-contract-manager)
							(isPromoterOwner nft-id)
						)) ERR-PERMISSION-DENIED)  ;; check permission, verify if the NFT belongs to the sender
		(try! (give-badge nft-id cycle))	;; give the badge to the NFT
		(try! (as-contract (contract-call? .treasury withdraw-deposit-fund (get reward cy-reward) tx-sender u1)))
        ;; if the NFT is in the top 3, give the bagdets to the NFT
    (ok true)
    )
)

(define-read-only (isPromoterOwner (token-id uint))
    (let (
        (result (unwrap-panic (contract-call? .promoter-nft get-owner token-id)))
    )
        (and (is-some result)
            (is-eq tx-sender (unwrap-panic result))
        )
    )
)

(define-private (give-badge (nft-id uint) (cycle uint))
	(let (
		(cy-rank (default-to {
			n1: u0, s1: u0,
			n2: u0, s2: u0,
			n3: u0, s3: u0
		} (map-get? ctrl-rank-cycle {cycle: cycle})))
	)
	(if (is-eq nft-id (get n1 cy-rank))
		(try! (contract-call? .promoter-nft add-top-1 nft-id))
		(if (is-eq nft-id (get n2 cy-rank))
			(try! (contract-call? .promoter-nft add-top-2 nft-id))
			(if (is-eq nft-id (get n3 cy-rank))
				(try! (contract-call? .promoter-nft add-top-3 nft-id))
				(try! (contract-call? .promoter-nft add-no-ranked nft-id))
			)
		)
	)
	(ok true)
	)
)