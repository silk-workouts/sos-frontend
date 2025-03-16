import Image from "next/image";
import closeIcon from "/public/assets/icons/close.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./ContactFormModal.module.scss";

interface contactModal {
	show: boolean;
	handleClose: () => void;
}

export default function ContactFormModal({ show, handleClose }: contactModal) {
	if (!show) {
		return null;
	}

	function handleCloseContactModal(e: React.MouseEvent<HTMLDivElement>) {
		const target = e.target;

		if (target instanceof HTMLElement && target.id === "dialog-container") {
			handleClose();
		}
	}

	return (
		<div
			id="dialog-container"
			role="button"
			className={styles["dialog-container"]}
			onClick={(e) => handleCloseContactModal(e)}
		>
			<div
				role="dialog"
				aria-labelledby="dialogTitle"
				className={styles.dialog}
			>
				<div className={styles.dialog__header}>
					<h2 id="dialogTitle" className="h2-title">
						Send us a message{" "}
					</h2>
					<button
						className={styles.dialog__closeButton}
						onClick={handleClose}
						aria-label="Close Contact Form"
					>
						<Image src={closeIcon} alt="" />
					</button>
				</div>

				<form className={`body1 ${styles.form}`}>
					<div className={styles["form__fields-wrapper"]}>
						<div className={styles["form__input-container"]}>
							<label htmlFor="name" className={styles.form__label}>
								name
							</label>
							<input
								id="name"
								type="text"
								name="name"
								className={styles.form__input}
							/>
						</div>
						<div className={styles["form__input-container"]}>
							<label htmlFor="email" className={styles.form__label}>
								email
							</label>
							<input
								id="email"
								type="email"
								name="email"
								className={styles.form__input}
							/>
						</div>
					</div>

					<div className={styles["form__input-container"]}>
						<label htmlFor="message" className={styles.form__label}>
							message
						</label>
						<textarea
							id="message"
							name="message"
							className={`${styles.form__input} ${styles["form__input--textarea"]}`}
						></textarea>
					</div>

					<div className={styles["form__button-container"]}>
						<button
							className={`body1 ${styles.form__button}`}
							onClick={handleClose}
						>
							Cancel
						</button>
						<Button variant="tertiary" onClick={handleClose}>
							Submit
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
