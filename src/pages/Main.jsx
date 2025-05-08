import React, {useState} from 'react';
import {useTranslation} from "react-i18next";

const Main = () => {
	const {t} = useTranslation()
	const [formData, setFormData] = useState({});
	const [educationType, setEducationType] = useState('');
	
	const handleChange = (questionKey, value) => {
		setFormData((prev) => ({
			...prev,
			[questionKey]: value,
		}));
		
		if (questionKey === 'question7') {
			setEducationType(value);
		}
	};
	
	const questions = Array.from({ length: 22 }, (_, i) => i + 1);
	
	const shouldRender = (qNum) => {
		if (qNum === 8 || qNum === 9) {
			return educationType === 'Texnikum' || educationType === 'Техникум';
		}
		return true;
	};
	
	return (
		<main className="bg-[rgb(248,249,250)] h-full">
			<div className="container mx-auto pt-20">
				<form className="max-w-3xl mx-auto p-6 space-y-6">
					<h1 className="text-2xl font-bold mb-4">{t('So‘rovnoma')}</h1>
					
					{questions.map((num) => {
						const qKey = `question${num}`;
						const aKey = `answer${num}`;
						
						if (!shouldRender(num)) return null;
						
						const options = t(aKey, {returnObjects: true});
						
						return (
							<div key={qKey} className="px-4 py-2 bg-white rounded">
								<label className="block font-medium mb-2">{t(qKey)}</label>
								
								{Array.isArray(options) ? (
									<div className="space-y-2">
										{options.map((opt, idx) => (
											<label key={idx} className="flex items-center gap-2">
												<input
													type="radio"
													name={qKey}
													value={opt}
													checked={formData[qKey] === opt}
													onChange={() => handleChange(qKey, opt)}
												/>
												<span>{opt}</span>
											</label>
										))}
									</div>
								) : (
									<input
										type="text"
										className="input"
										value={formData[qKey] || ''}
										onChange={(e) => handleChange(qKey, e.target.value)}
									/>
								)}
							</div>
						);
					})}
					
					<button
						type="submit"
						className="btn mt-6"
						onClick={(e) => {
							e.preventDefault();
							console.log('Yuborilgan:', formData);
							alert('So‘rovnoma yuborildi!');
						}}
					>
						{t('Yuborish')}
					</button>
				</form>
			</div>
		</main>
	);
};

export default Main;