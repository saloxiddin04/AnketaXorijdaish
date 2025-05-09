import {useEffect, useState} from 'react';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {toast} from "react-toastify";

export const api_url = "http://api-xorijdaish.asilbro.uz"

const Main = () => {
	const {t} = useTranslation();
	
	const [formData, setFormData] = useState({});
	const [regions, setRegions] = useState([]);
	const [districts, setDistricts] = useState([]);
	
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
				
				const languages = [
					...(specialtiesRes.data?.languages || []),
					{ id: 'other', name: 'Boshqa' }, // yoki "Другое" agar rus tilida kerak bo‘lsa
				];
				
				const regionsFilter = regionsRes.data?.filter((el) => el?.code === "UZ")
				
				setOptions({
					regions: regionsFilter,
					specialties: specialtiesRes.data?.college_specialty,
					professions: specialtiesRes.data?.profession,
					fears_abroad: specialtiesRes.data?.fears_abroad,
					languages: languages
				});
				
				setRegions(regionsFilter[0]?.regions || []);
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
	
	const renderRadioGroup = (key, items, onSelect) => {
		const selectedValue = formData[key];
		
		const selectedItemText = items
			.map((item, idx) => ({
				text: typeof item === 'string' ? item : item?.name,
				value: typeof item === "object" ? item?.id : idx,
			}))
			.find((item) => item.value === selectedValue)?.text?.toLowerCase();
		
		const isOtherSelected =
			selectedItemText === "boshqa" || selectedItemText === "другое";
		
		return (
			<div className="space-y-2">
				{items.map((item, idx) => {
					const text = typeof item === 'string' ? item : item?.name;
					const value = typeof item === "object" ? item?.id : idx;
					const itemText = text?.toLowerCase();
					
					return (
						<label key={idx} className="flex items-center gap-2">
							<input
								type="radio"
								name={key}
								value={value}
								checked={formData[key] === value}
								onChange={() => {
									handleChange(key, value);
									
									// Agar boshqa variant tanlansa, customni o'chiramiz
									if (
										key === "question13" &&
										itemText !== "boshqa" &&
										itemText !== "другое"
									) {
										setFormData((prev) => ({
											...prev,
											custom_intended_field_of_study: undefined,
										}));
									}
									
									if (
										key === "question18" &&
										itemText !== "boshqa" &&
										itemText !== "другое"
									) {
										setFormData((prev) => ({
											...prev,
											custom_planned_job: undefined,
										}));
									}
									
									if (
										key === "question22" &&
										itemText !== "boshqa" &&
										itemText !== "другое"
									) {
										setFormData((prev) => ({
											...prev,
											custom_preferred_country: undefined,
										}));
									}
									
									if (onSelect) onSelect(item);
								}}
							/>
							<span>{text}</span>
						</label>
					);
				})}
				
				{/* Faqat "Boshqa" tanlansa input ko‘rinadi */}
				{isOtherSelected && (
					<input
						type="text"
						className="mt-2 w-full border border-gray-300 p-2 rounded"
						placeholder="Iltimos, aniqlashtiring"
						// Dinamik value, key ga qarab qiymatni olish
						value={
							key === "question13"
								? formData.custom_intended_field_of_study
								: key === "question18"
									? formData.custom_planned_job
									: key === "question16"
									? formData.custom_desired_language
									: key === "question22"
											? formData.custom_preferred_country
											: ""
						}
						onChange={(e) => {
							// Dinamik `setFormData` bilan formData'ni yangilash
							setFormData((prev) => ({
								...prev,
								// `key` ga qarab mos bo'lgan custom fieldni yangilash
								[key === "question13" ? "custom_intended_field_of_study" : key === "question18" ? "custom_planned_job" : key === "question16" ? "custom_desired_language" : key === "question22" ? "custom_preferred_country" : ""]: e.target.value,
							}));
						}}
					/>
				)}
			
			</div>
		);
	};
	
	const renderCheckboxGroup = (key, items) => {
		const selectedItems = formData[key] || [];
		
		const isOtherSelected = selectedItems.includes('other');
		
		const handleCheckboxChange = (e, itemId) => {
			const checked = e.target.checked;
			setFormData((prev) => {
				const current = prev[key] || [];
				
				if (itemId === "other") {
					// "other" ni tanlasak, boshqa variantlarni olib tashlaymiz
					return {
						...prev,
						[key]: checked ? [itemId] : [], // Faqat "other" bo'lsin
						custom_known_languages: "", // custom inputni bo'shatamiz
					};
				} else {
					// "other" tanlanmasa, tanlanganlarni qo'shish yoki olib tashlash
					const updatedSelection = checked
						? [...current.filter((id) => id !== "other"), itemId] // "other"ni olib tashlaymiz
						: current.filter((id) => id !== itemId);
					
					return {
						...prev,
						[key]: updatedSelection,
					};
				}
			});
		};
		
		return (
			<div className="space-y-2">
				{items.map((item, idx) => {
					const text = typeof item === 'string' ? item : item?.name;
					const value = item.id || "";
					
					// Agar "other" tanlangan bo'lsa, boshqa variantlar checked bo'lmasligi kerak
					const isChecked = isOtherSelected && value !== "other" ? false : selectedItems.includes(value);
					
					return (
						<label key={idx} className="flex items-center gap-2">
							<input
								type="checkbox"
								value={value}
								checked={isChecked} // "other" tanlanganida boshqa variantlar checked bo'lmasin
								onChange={(e) => handleCheckboxChange(e, value)}
							/>
							<span>{text}</span>
						</label>
					);
				})}
				
				{/* "other" tanlanganida input ko'rsatiladi */}
				{isOtherSelected && (
					<input
						type="text"
						className="mt-2 w-full border border-gray-300 p-2 rounded"
						placeholder="Iltimos, tilni kiriting"
						value={formData.custom_known_languages || ''}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								custom_known_languages: e.target.value,
							}))
						}
					/>
				)}
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
			<option value="" disabled={formData[name]}>{t('Tanlang')}</option>
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
		"region": formData?.questionRegion,
		"gender": formData?.question7, // 1-> erkak, 0 -> ayol
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
		"intended_field_of_study": formData?.question13 === 5 ? undefined : formData?.question13,
		"custom_intended_field_of_study": formData?.custom_intended_field_of_study,
		
		"optional_profession": formData?.question14,
		"known_languages": formData?.question15 == "other" ? undefined : formData?.question15,
		"custom_known_languages": formData?.custom_known_languages, // agar known_languages=null bo'sa
		
		"desired_languages": formData?.question16 === "other" ? undefined : [formData?.question16],
		"custom_desired_language": formData?.custom_desired_language,
		
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
		"planned_job": formData?.question18 === 7 ? undefined : formData?.question18,
		"custom_planned_job": formData?.question18 === 7 ? formData?.custom_planned_job : undefined, // agar planned_job=null bo'lsa
		
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
		"preferred_country": formData?.question22 === 6 ? undefined : formData?.question22,
		"custom_preferred_country": formData?.question22 === 6 ? formData?.custom_preferred_country : undefined, // agar preferred_country=null bo'lsa
		
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
		// 'questionCountry',
		'questionRegion',
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
	
	const validateForm = () => {
		const requiredFields = [
			'question1', // last_name
			'question2', // first_name
			'question3', // mid_name
			'question4', // birth_date
			'question5', // phone_number
			'question7', // gender
			'questionRegion',
			'questionDistrict',
			'question9', // current_study_place
			'question12', // future_plan_after_graduation
			'question17', // abroad_work_interest
			'question19', // parent_support_abroad
			'question21', // family_abroad_status
		];
		
		const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
		const phoneRegex = /^998\d{9}$/;
		
		if (formData?.question4 && !birthDateRegex.test(formData.question4)) {
			toast.error("Tug‘ilgan sana YYYY-MM-DD formatida bo‘lishi kerak.");
			return false;
		}
		
		if (formData?.question5 && !phoneRegex.test(formData.question5)) {
			toast.error("Telefon raqam 998XXXXXXXXX formatida bo‘lishi kerak.");
			return false;
		}
		
		if (formData?.question6 && !phoneRegex.test(formData.question6)) {
			toast.error("Qo‘shimcha raqam 998XXXXXXXXX formatida bo‘lishi kerak.");
			return false;
		}
		
		for (let field of requiredFields) {
			if (
				formData[field] === undefined ||
				formData[field] === null ||
				formData[field] === ''
			) {
				toast.error(`Iltimos, barcha maydonini to‘ldiring.`);
				return false;
			}
		}
		
		// Custom fieldlar uchun alohida tekshiruv
		if (formData?.question13 === 'other' && !formData.custom_intended_field_of_study) {
			toast.error('Iltimos, rejalashtirilgan sohani aniqlashtiring.');
			return false;
		}
		if (formData?.question18 === 7 && !formData.custom_planned_job) {
			toast.error('Iltimos, rejalashtirilgan ishni aniqlashtiring.');
			return false;
		}
		if (formData?.question15 === 'other' && !formData.custom_known_languages) {
			toast.error('Iltimos, tilni aniqlashtiring.');
			return false;
		}
		if (formData?.question22 === 6 && !formData.custom_preferred_country) {
			toast.error('Iltimos, davlatni aniqlashtiring.');
			return false;
		}
		
		return true;
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!validateForm()) return;
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
					<h1 className="text-center text-2xl">
						Yoshlarning kasbiy rejalari va chet elda ishlashga tayyorligi bo‘yicha SO‘ROVNOMA
					</h1>
					<span className="text-center flex justify-center mx-auto italic">
						(maktab va texnikum bitiruvchilari uchun)
					</span>
					<p className="text-xl px-2 py-4 bg-white border-t-4 border-t-blue-400 rounded text-justify">
						&nbsp;&nbsp;&nbsp;Hurmatli, Bitiruvchi! Ushbu so‘rovnoma sizning hozirgi holatingiz, kasbiy rejalaringiz va chet elda o‘qish yoki ishlashga tayyorgarligingiz haqida ma’lumot olish uchun mo‘ljallangan. Javoblaringiz asosida sizga mos ta’lim va kasb-hunar loyihalarini yaratish rejalashtirilmoqda.
						<br/>
						<br/>
						&nbsp;&nbsp;&nbsp;So‘rovnoma shaxsiy ma’lumotlar xavfsizligini ta’minlagan holda o‘tkaziladi.
						<br/>
						<br/>
						&nbsp;&nbsp;&nbsp;Iltimos, barcha savollarga to‘liq va samimiy javob bering. Katta Rahmat!
					</p>
					
					{questionOrder.map((qKey, index) => {
						const aKey = qKey?.replace('question', 'answer');
						
						if ((qKey === 'question10' || qKey === 'question11') && !showTechFields) return null;
						
						// if (qKey === 'questionCountry') {
						// 	return (
						// 		<div key={qKey} className="py-4 px-2 bg-white rounded">
						// 			<label className="block font-semibold mb-2">{t('Davlat')}</label>
						// 			{renderSelect(qKey, options.regions, (country) => {
						// 				setRegions(country.regions || []);
						// 				setDistricts([]);
						// 				setSelectedRegionId(null);
						// 				handleChange('questionRegion', '');
						// 				handleChange('questionDistrict', '');
						// 			})}
						// 		</div>
						// 	);
						// }
						
						if (qKey === 'questionRegion') {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t('Viloyat')}</label>
									{renderSelect(qKey, regions, (region) => {
										setSelectedRegionId(region.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'questionDistrict' && districts.length > 0) {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t('Tuman')}</label>
									{renderSelect(qKey, districts)}
								</div>
							);
						}
						
						if (qKey === 'question10' && showTechFields) {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options.specialties, (specialtie) => {
										handleChange('question10', specialtie?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question14') {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options?.professions, (profession) => {
										handleChange('question14', profession?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question15') {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderCheckboxGroup(qKey, options?.languages || [])}
								</div>
							);
						}
						
						if (qKey === 'question16') {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderRadioGroup(qKey, options?.languages, (language) => {
										handleChange('question16', language?.id);
									})}
								</div>
							);
						}
						
						if (qKey === 'question20') {
							return (
								<div key={qKey} className="py-4 px-2 bg-white rounded">
									<label className="block font-semibold mb-2">{t(qKey)}</label>
									{renderCheckboxGroup(qKey, options?.fears_abroad || [])}
								</div>
							);
						}
						
						const answers = t(aKey, {returnObjects: true});
						
						return (
							<div key={index} className="py-4 px-2 bg-white rounded">
								<label className="block font-semibold mb-2">{t(qKey)}</label>
								{Array.isArray(answers) ? renderRadioGroup(qKey, answers)
									: (answers !== "" &&
										<input
											type={
												qKey === "question4" ? "date"
													: (qKey === "question5" || qKey === "question6") ? "tel"
														: "text"
											}
											placeholder={
												qKey === "question4"
													? "YYYY-MM-DD"
													: (qKey === "question5" || qKey === "question6")
														? "998xxxxxxxxx"
														: ""
											}
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
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex justify-center mx-auto"
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