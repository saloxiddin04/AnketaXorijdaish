import {useEffect, useState} from 'react';
import axios from 'axios';
import {useTranslation} from 'react-i18next';

export const api_url = "http://api-xorijdaish.asilbro.uz"

const Main = () => {
	const {t} = useTranslation();
	
	const [formData, setFormData] = useState({});
	const [countries, setCountries] = useState([]);
	const [regions, setRegions] = useState([]);
	const [districts, setDistricts] = useState([]);
	
	const [selectedCountryId, setSelectedCountryId] = useState(null);
	const [selectedRegionId, setSelectedRegionId] = useState(null);
	
	const [options, setOptions] = useState({
		regions: [],
		specialties: [],
		professions: [],
		fears_abroad: [],
		languages: []
	});
	
	const handleChange = (key, value) => {
		setFormData((prev) => ({...prev, [key]: value}));
	};
	
	const showTechFields = formData['question9'] === 'Texnikum' || formData['question9'] === 'Техникум';
	
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [regionsRes, specialtiesRes] = await Promise.all([
					axios.get(`${api_url}/user/get-countries-regions`),
					axios.get(`${api_url}/questionnaire/graduate-survey`),
				]);
				setOptions({
					regions: regionsRes.data,
					specialties: specialtiesRes.data?.college_specialty,
					professions: specialtiesRes.data?.profession,
					fears_abroad: specialtiesRes.data?.fears_abroad,
					languages: specialtiesRes.data?.languages
				});
				setCountries(regionsRes.data);
			} catch (err) {
				console.error('Data loading failed:', err);
			}
		};
		fetchInitialData();
	}, []);
	
	useEffect(() => {
		if (!selectedRegionId) return;
		const fetchDistricts = async () => {
			try {
				const res = await axios.get(`${api_url}/user/get-districts/${selectedRegionId}`);
				setDistricts(res.data);
			} catch (err) {
				console.error('Tumanlar yuklanmadi:', err);
			}
		};
		fetchDistricts();
	}, [selectedRegionId]);
	
	const renderRadioGroup = (key, items, onSelect) => (
		<div className="space-y-2">
			{items.map((item, idx) => {
				const value = typeof item === 'string' ? item : item.name;
				return (
					<label key={idx} className="flex items-center gap-2">
						<input
							type="radio"
							name={key}
							value={value}
							checked={formData[key] === value}
							onChange={() => {
								handleChange(key, value);
								if (onSelect) onSelect(item);
							}}
						/>
						<span>{value}</span>
					</label>
				);
			})}
		</div>
	);
	
	const questionOrder = [
		'question1',
		'question2',
		'question3',
		'question4',
		'question5',
		'question6',
		'question7',
		'questionCountry',
		regions?.length > 0 ? 'questionRegion' : "",
		districts?.length > 0 ? 'questionDistrict' : "",
		'question9',
		'question10',
		'question11',
		'question12',
		'question13',
		'question14',
		'question15',
		'question16',
		'question17',
		'question18',
		'question19',
		'question20',
		'question21',
		'question22',
		'question23',
		'question24'
	];
	
	return (
		<main className="bg-[rgb(248,249,250)] h-full">
			<div className="container mx-auto pt-20">
				<form className="max-w-3xl mx-auto p-6 space-y-6">
					<h1 className="text-2xl font-bold">{t('So‘rovnoma')}</h1>
					
					{questionOrder.map((qKey, index) => {
						const aKey = qKey.replace('question', 'answer');
						
						if ((qKey === 'question10' || qKey === 'question11') && !showTechFields) return null;
						
						if (qKey === 'questionCountry') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t('Davlat')}</label>
									{renderRadioGroup(qKey, countries, (country) => {
										setSelectedCountryId(country.id);
										setRegions(country.regions || []);
										setDistricts([]);
										setSelectedRegionId(null);
										handleChange('questionRegion', '');
										handleChange('questionDistrict', '');
									})}
								</div>
							);
						}
						
						if (qKey === 'questionRegion' && regions.length > 0) {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t('Viloyat')}</label>
									{renderRadioGroup(qKey, regions, (region) => {
										setSelectedRegionId(region.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'questionDistrict' && districts.length > 0) {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t('Tuman')}</label>
									{renderRadioGroup(qKey, districts)}
								</div>
							);
						}
						
						if (qKey === 'question10' && showTechFields) {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options.specialties)}
								</div>
							);
						}
						
						if (qKey === 'question14') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options.professions)}
								</div>
							);
						}
						
						const answers = t(aKey, {returnObjects: true});
						
						return (
							<div key={index}>
								<label className="block font-semibold mb-2">{t(qKey)}</label>
								{Array.isArray(answers) ? renderRadioGroup(qKey, answers)
									: ( answers !== "" &&
										<input
											type="text"
											className="w-full p-2 border border-gray-300 rounded"
											value={formData[qKey] || ''}
											onChange={(e) => handleChange(qKey, e.target.value)}
										/>
									)}
							</div>
						);
					})}
					
					<button
						type="submit"
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
						onClick={(e) => {
							e.preventDefault();
							console.log('Yuborilgan:', formData);
							alert('So‘rovnoma yuborildi!');
						}}
					>
						{t('Yuborish') || 'Yuborish'}
					</button>
				</form>
			</div>
		</main>
	);
};

export default Main;