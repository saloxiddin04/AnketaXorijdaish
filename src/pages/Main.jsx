import {useEffect, useState} from 'react';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {toast} from "react-toastify";

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
	
	const showTechFields = formData['question9'] === 1 || formData['question9'] === 'Техникум';
	
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
				const text = typeof item === 'string' ? item : item?.name;
				
				return (
					<label key={idx} className="flex items-center gap-2">
						<input
							type="radio"
							name={key}
							value={typeof item === "object" ? item?.id : idx}
							checked={formData[key] === (typeof item === "object" ? item?.id : idx)}
							onChange={() => {
								handleChange(key, idx);
								if (onSelect) onSelect(item);
							}}
						/>
						<span>{text}</span>
					</label>
				);
			})}
		</div>
	);
	
	const renderCheckboxGroup = (key, items) => {
		return (
			<div className="space-y-2">
				{items.map((item) => (
					<label key={item.id} className="flex items-center gap-2">
						<input
							type="radio"
							value={item.id || ""}
							checked={formData[key]?.includes(item.id) || ""}
							onChange={(e) => {
								const checked = e.target.checked;
								setFormData((prev) => {
									const current = prev[key] || [];
									return {
										...prev,
										[key]: checked
											? [...current, item.id]
											: current.filter((id) => id !== item.id)
									};
								});
							}}
						/>
						<span>{item.name}</span>
					</label>
				))}
			</div>
		);
	};
	
	const renderSelect = (name, options, onChange) => (
		<select
			name={name}
			className="border border-gray-300 rounded px-3 py-2 w-full"
			value={formData[name] || ''}
			onChange={(e) => {
				const selectedOption = options.find(opt => opt.id === e.target.value);
				if (onChange) onChange(selectedOption);
				handleChange(name, e.target.value);
			}}
		>
			<option value="">{t('Tanlang')}</option>
			{options.map((opt) => (
				<option key={opt.id} value={opt.id}>
					{opt.name}
				</option>
			))}
		</select>
	);
	
	
	const data = {
		"last_name": formData?.question1,
		"first_name": formData?.question2,
		"mid_name": formData?.question3,
		"birth_date": formData?.question4,
		"phone_number": formData?.question5,
		"add_phone_number": formData?.question6,
		"gender": formData?.question7, // 1-> erkak, 0 -> ayol
		"region": formData?.questionRegion,
		"district": formData?.questionDistrict,
		"current_study_place": formData?.question9, // 0 -> Maktab (11 sinf), 1-> Texnikum
		"college_specialty": formData?.question9 === 1 ? formData?.question10 : undefined,
		
		// ONLY_DIPLOMA = 0, _("Faqat diplomim bor, sohamni yaxshi bilmayman")
		// KNOW_FIELD = 1, _("O‘z sohamni yaxshi bilaman")
		// HAVE_EXPERIENCE = 2, _("Soham bo‘yicha tajribaga ham egaman")
		// TOOK_COURSE = 3, _("Soham bo‘yicha qo‘shimcha kursda o‘qiganman")
		// WANT_COURSE = 4, _("Soham bo‘yicha qo‘shimcha kursda o‘qishni xohlayman")
		"professional_readiness": formData?.question9 === 1 ? formData?.question11 : undefined,
		
		// UNIVERSITY = 0, _("Universitetga o‘qishga kirmoqchiman")
		// WORK_UZB = 1, _("O‘zbekistonda ishlamoqchiman")
		// WORK_ABROAD = 2, _("Chet elga ishlashga ketmoqchiman")
		// UNKNOWN = 3, _("Hozircha bilmayman")
		"future_plan_after_graduation": formData?.question12,
		
		// MEDICINE = 0, _("Tibbiyot")
		// ENGINEERING = 1, _("Texnika/injiniring")
		// ECONOMY = 2, _("Iqtisodiyot/moliya")
		// TEACHING = 3, _("O‘qituvchilik")
		// ART = 4, _("San’at/yoshlar ishi")
		// null =  _("Boshqa")
		"intended_field_of_study": formData?.question13,
		// "custom_intended_field_of_study": "aktyo'r",
		
		"optional_profession": formData?.question14,
		"known_languages": formData?.question15,
		// "custom_known_languages": "o'ris tili" // agar known_languages=null bo'sa
		
		"desired_languages": [formData?.question16],
		// "custom_desired_language": "Mo'g'il tili",
		
		// SERIOUS = 0, _("Ha, jiddiy o‘ylayapman")
		// DOUBTFUL = 1, _("Ha, lekin ishonchim yo‘q")
		// NO_PLAN = 2, _("Yo‘q, bunday rejam yo‘q")
		// UNSURE = 3, _("Bilmayman")
		"abroad_work_interest": formData?.question17,
		
		// NURSE = 0, _("Hamshira")
		// BUILDER = 1, _("Quruvchi")
		// DRIVER = 2, _("Haydovchi")
		// CHEF = 3, _("Oshpaz")
		// DEVELOPER_IT = 4, _("Dasturchi/IT")
		// TAILOR = 5, _("Tikuvchi")
		// INDUSTRIAL = 6, _("Ishlab chiqarish")
		"planned_job": formData?.question18,
		// "custom_planned_job": "bekorchi", // agar planned_job=null bo'lsa
		
		// SUPPORT = 0, _("To‘liq qo‘llab-quvvatlaydi")
		// NEUTRAL = 1, _("Qarshi emas, lekin xavotirda")
		// AGAINST = 2, _("Qarshi")
		"parent_support_abroad": formData?.question19,
		
		"fears_abroad": formData?.question20,
		
		// ONE = 0, _("Ha, biri")
		// BOTH = 1, _("Ha, ikkisi ham")
		// NO = 2, _("Yo‘q")
		// PAST = 3, _("Oldin ishlagan, hozir yo‘q")
		"family_abroad_status": formData?.question21,
		
		// RUSSIA = 0, _("Rossiya")
		// KOREA = 1, _("Koreya")
		// GERMANY = 2, _("Germaniya")
		// UK = 3, _("Buyuk Britaniya")
		// JAPAN = 4, _("Yaponiya")
		// TURKEY = 5, _("Turkiya")
		"preferred_country": formData?.question22,
		// "custom_preferred_country": "Amazonka", // agar preferred_country=null bo'lsa
		
		// RETURN = 0, _("Orqaga qaytaman")
		// ASK_HELP = 1, _("Yordam so‘rayman va davom etaman")
		// EXPLORE = 2, _("Yangi yo‘llarni izlayman")
		"failure_response": formData?.question23,
		
		// READY = 0, _("Ha, 100%")
		// NEED_TO_LEARN_LANGUAGE = 1, _(" Xorijiy tilni o‘rganishim kerak")
		// NEED_TO_LEARN_SKILLS = 2, _("Kasb-hunar o‘rganishim kerak")
		// NOT_READY = 3, _("Yo‘q, hozircha rejam yo‘q")
		"abroad_opportunity": formData?.question24
	}
	
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
	
	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const response = await axios.post(`${api_url}/questionnaire/graduate-survey`, data)
			if (response.status === 201) {
				toast.success("Muvufaqqiyatli yuborildi!")
				setFormData({})
			}
			console.log("response", response)
			console.log("formData", formData)
		} catch (e) {
			return e;
		}
	}
	
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
									{renderSelect(qKey, countries, (country) => {
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
									{renderSelect(qKey, regions, (region) => {
										setSelectedRegionId(region.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'questionDistrict' && districts.length > 0) {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t('Tuman')}</label>
									{renderSelect(qKey, districts)}
								</div>
							);
						}
						
						if (qKey === 'question10' && showTechFields) {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options.specialties, (specialtie) => {
										handleChange('question10', specialtie?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question14') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options?.professions, (profession) => {
										handleChange('question14', profession?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question15') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderCheckboxGroup(qKey, options?.languages || [])}
								</div>
							);
						}
						
						if (qKey === 'question16') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options?.languages, (language) => {
										handleChange('question16', language?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question20') {
							return (
								<div key={qKey}>
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderCheckboxGroup(qKey, options?.fears_abroad || [])}
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
											type={qKey === "question4" ? "date" : "text"}
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
						onClick={handleSubmit}
					>
						{t('Yuborish') || 'Yuborish'}
					</button>
				</form>
			</div>
		</main>
	);
};

export default Main;