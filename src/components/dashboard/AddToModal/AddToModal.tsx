import styles from "./AddToModal.module.scss";

interface AddModal {
	isOpen: boolean;
	setIsOpen: (arg1: boolean) => void;
}

export default function AddToModal({ isOpen, setIsOpen }: AddModal) {
	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		const target = event.target;

		if (target instanceof HTMLElement && target.id === "dialog-container") {
			setIsOpen(false);
		}
	}

	return (
		<>
			{isOpen && (
				<div
					className={styles["dialog-container"]}
					onClick={(event) => handleCloseModal(event)}
					id="dialog-container"
					role="dialog button"
				>
					<ul className={styles.dialog} role="menu" aria-label="">
						<li className={styles.dialog__option} role="menuitem">
							Add to queue
						</li>
						<li className={styles.dialog__option} role="menuitem">
							Add to playlist
						</li>
					</ul>
				</div>
			)}
		</>
	);
}
