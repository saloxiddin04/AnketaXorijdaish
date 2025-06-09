import {useEffect, useState} from 'react';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {toast} from "react-toastify";

export const api_url = "https://cabinet-test.xorijdaish.uz"

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
	
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [regionsRes, specialtiesRes] = await Promise.all([
					axios.get(`${api_url}/user/get-countries-regions`),
					axios.get(`${api_url}/questionnaire/graduate-survey`),
				]);
				
				const regionsFilter = regionsRes.data?.filter((el) => el?.code === "UZ")
				
				setOptions({
					regions: regionsFilter,
					specialties: specialtiesRes.data?.college_specialty,
					professions: specialtiesRes.data?.profession,
					fears_abroad: specialtiesRes.data?.fears_abroad,
					languages: specialtiesRes.data?.languages
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
	
	const handleCheckboxChange = (key, value) => {
		setFormData((prev) => {
			const current = prev[key] || [];
			
			let updated = [];
			
			if (value === 'other' || value === 'Boshqa') {
				// "Boshqa" tanlansa — boshqa hammasini olib tashlab faqat Boshqa qoldiramiz
				updated = ['Boshqa'];
			} else {
				// Agar boshqa tanlov bo‘lsa — "Boshqa"ni olib tashlaymiz
				updated = current.includes(value)
					? current.filter((item) => item !== value)
					: [...current.filter((item) => item !== 'Boshqa'), value];
			}
			
			return {
				...prev,
				[key]: updated,
				[`custom_${key}`]: updated.includes('Boshqa') ? prev[`custom_${key}`] || '' : undefined,
			};
		});
	};
	
	const renderMultipleCheckboxGroup = (key, items, text) => {
		const selectedItems = formData[key] || [];
		const isOtherSelected = selectedItems.includes('Boshqa');
		
		return (
			<div className="space-y-2">
				<label className="block font-semibold mb-2">{text}</label>
				{items.map((item, idx) => (
					<label key={idx} className="flex items-center gap-2">
						<input
							type="checkbox"
							value={item?.id}
							checked={selectedItems.includes(item?.id)}
							onChange={() => handleCheckboxChange(key, item?.id)}
						/>
						{item?.name}
					</label>
				))}
				{isOtherSelected && (
					<input
						type="text"
						className="mt-2 w-full border border-gray-300 p-2 rounded"
						placeholder="Iltimos, aniqlashtiring"
						value={formData[`custom_${key}`] || ''}
						onChange={(e) => handleChange(`custom_${key}`, e.target.value)}
					/>
				)}
			</div>
		);
	};
	
	const hechBiriniObj = options?.languages?.find(lang => lang?.name === 'Hech birini');
	const HECH_BIRINI_ID = hechBiriniObj?.id;
	
	const data = {
		last_name: formData.last_name,
		first_name: formData.first_name,
		mid_name: formData.mid_name,
		birth_date: formData.birth_date,
		phone_number: formData.phone_number,
		add_phone_number: formData.add_phone_number,
		region: formData.region,
		district: formData.district,
		gender: formData.gender,
		
		current_study_place: formData.current_study_place,
		college_specialty: ((formData.current_study_place === 1 || formData.current_study_place === 2) && formData.college_specialty !== 5) ? formData.college_specialty : undefined,
		custom_college_specialty: formData.college_specialty === 5 ? formData.custom_college_specialty : undefined,
		professional_readiness:
			(formData.current_study_place === 1 || formData.current_study_place === 2) ? formData.professional_readiness : undefined,
		
		future_plan_after_graduation: formData.future_plan_after_graduation === 5 ? undefined : formData.future_plan_after_graduation,
		custom_future_plan_after_graduation: formData.future_plan_after_graduation === 5 ? formData.custom_future_plan_after_graduation : undefined,
		
		intended_field_of_study:
			formData.intended_field_of_study === 5 ? undefined : formData.intended_field_of_study,
		custom_intended_field_of_study:
			formData.intended_field_of_study === 5 ? formData.custom_intended_field_of_study : undefined,
		
		optional_profession: formData.optional_profession === 5 ? undefined : formData.optional_profession,
		custom_optional_profession: formData.optional_profession === 5 ? formData.custom_optional_profession : undefined,
		
		known_languages: Array.isArray(formData.known_languages) &&
		formData.known_languages.includes('Boshqa') ? undefined : [formData.known_languages],
		custom_known_languages: Array.isArray(formData.known_languages) &&
		formData.known_languages.includes('Boshqa') ? formData.custom_known_languages : undefined,
		
		desired_languages:
			formData.desired_languages === 5 ? undefined : [formData.desired_languages],
		custom_desired_language:
			formData.desired_languages === 5 ? formData.custom_desired_languages : undefined,
		
		abroad_work_interest: formData.abroad_work_interest,
		planned_job: formData.planned_job === 7 ? undefined : formData.planned_job,
		custom_planned_job:
			formData.planned_job === 7 ? formData.custom_planned_job : undefined,
		
		parent_support_abroad: formData.parent_support_abroad,
		fears_abroad: formData.fears_abroad,
		
		family_abroad_status: formData.family_abroad_status,
		preferred_country: formData.preferred_country === 6 ? undefined : formData.preferred_country,
		custom_preferred_country:
			formData.preferred_country === 6 ? formData.custom_preferred_country : undefined,
		
		failure_response: formData.failure_response,
		abroad_opportunity: formData.abroad_opportunity,
		expected_salary: formData.expected_salary,
		job_info_source: formData.job_info_source === 6 ? undefined : formData.job_info_source,
		custom_job_info_source: formData.job_info_source === 6 ? formData.custom_job_info_source : undefined,
		educational_institution: formData.educational_institution,
		language_level: formData.language_level !== HECH_BIRINI_ID ? formData.language_level : undefined
	};
	
	const validateForm = () => {
		const requiredFields = [
			'last_name', 'first_name', 'mid_name', 'birth_date',
			'phone_number', 'add_phone_number', 'gender',
			'region', 'district', 'current_study_place',
			'future_plan_after_graduation', 'abroad_work_interest',
			'parent_support_abroad', 'family_abroad_status',
			'preferred_country',
			'failure_response',
			'abroad_opportunity',
			'expected_salary',
			'job_info_source',
			'educational_institution'
		];
		
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
		
		const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
		const phoneRegex = /^998\d{9}$/;
		
		if (formData?.birth_date && !birthDateRegex.test(formData.birth_date)) {
			toast.error("Tug‘ilgan sana YYYY-MM-DD formatida bo‘lishi kerak.");
			return false;
		}
		
		if (formData?.phone_number && !phoneRegex.test(formData.phone_number)) {
			toast.error("Telefon raqam 998XXXXXXXXX formatida bo‘lishi kerak.");
			return false;
		}
		
		if (formData?.add_phone_number && !phoneRegex.test(formData.add_phone_number)) {
			toast.error("Qo‘shimcha raqam 998XXXXXXXXX formatida bo‘lishi kerak.");
			return false;
		}
		
		// Custom fieldlar uchun validatsiya
		if (formData.intended_field_of_study === 5 && !formData.custom_intended_field_of_study) {
			toast.error("Iltimos, o'qimoqchi bo'lgan sohaga aniqlik kiriting.");
			return false;
		}
		
		if (formData.future_plan_after_graduation === 5 && !formData.custom_future_plan_after_graduation) {
			toast.error("Iltimos, o'qimoqchi bo'lgan sohaga aniqlik kiriting.");
			return false;
		}
		
		if (formData.job_info_source === 6 && !formData.custom_job_info_source) {
			toast.error("Iltimos,  Xorijda mavjud bo‘sh ish o‘rinlari haqidagi ma’lumotlarni ko'rsating.");
			return false;
		}
		
		if (formData.optional_profession === 5 && !formData.custom_optional_profession) {
			toast.error("Iltimos, kasbni aniqlashtiring.");
			return false;
		}
		if (formData.college_specialty === 5 && !formData.custom_college_specialty) {
			toast.error("Iltimos, kasbni aniqlashtiring.");
			return false;
		}
		
		if (formData.planned_job === 7 && !formData.custom_planned_job) {
			toast.error("Iltimos, ishlamoqchi bo'lgan sohani aniqlashtiring.");
			return false;
		}
		
		if (formData.desired_languages === 5 && !formData.custom_desired_languages) {
			toast.error("Iltimos, o'rganmoqchi bo'lgan tilni kiriting.");
			return false;
		}
		
		if (formData["known_languages"] !== HECH_BIRINI_ID && !formData.language_level) {
			toast.error("Til bilish darajangizni tanlang.");
			return false;
		}
		
		if (
			formData.known_languages?.includes("Boshqa") &&
			!formData.custom_known_languages
		) {
			toast.error("Iltimos, biladigan tilni aniqlashtiring.");
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
				<form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
					<h1 className="text-center text-2xl font-bold">
						Yoshlarning kasbiy rejalari va chet elda ishlashga tayyorligi bo‘yicha SO‘ROVNOMA
					</h1>
					<span className="text-center flex justify-center mx-auto italic">
						(maktab va texnikum bitiruvchilari uchun)
					</span>
					<p className="text-xl px-2 py-4 bg-white border-t-4 border-t-blue-400 rounded text-justify">
						&nbsp;&nbsp;&nbsp;Hurmatli bitiruvchi! Ushbu so‘rovnoma sizning hozirgi holatingiz, kasbiy rejalaringiz va
						chet elda o‘qish yoki ishlashga tayyorgarligingiz haqida ma’lumot olish uchun mo‘ljallangan. Javoblaringiz
						asosida sizga mos ta’lim va kasb-hunar loyihalarini yaratish rejalashtirilmoqda.
						<br/>
						<br/>
						&nbsp;&nbsp;&nbsp;So‘rovnoma shaxsiy ma’lumotlar xavfsizligini ta’minlagan holda o‘tkaziladi.
						<br/>
						<br/>
						&nbsp;&nbsp;&nbsp;Iltimos, barcha savollarga to‘liq va samimiy javob bering. Katta rahmat!
					</p>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">1. Familiyangiz</label>
						<input
							required
							type="text"
							placeholder="Familiyangiz"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['last_name'] || ''}
							onChange={(e) => handleChange("last_name", e.target.value)}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">2. Ismingiz</label>
						<input
							required
							type="text"
							placeholder="Ismingiz"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['first_name'] || ''}
							onChange={(e) => handleChange("first_name", e.target.value)}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">3. Sharifingiz</label>
						<input
							required
							type="text"
							placeholder="Sharifingiz"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['mid_name'] || ''}
							onChange={(e) => handleChange("mid_name", e.target.value)}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">4. Tug'ilgan kuningiz</label>
						<input
							required
							type="date"
							placeholder="Tug'ilgan kuningiz"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['birth_date'] || ''}
							onChange={(e) => {
								const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
								if (birthDateRegex.test(e.target.value)) {
									handleChange("birth_date", e.target.value)
								}
							}}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">5. Telefon raqamingiz</label>
						<input
							required
							type="text"
							placeholder="998xxxxxxxxx"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['phone_number'] || ''}
							onChange={(e) =>
								handleChange("phone_number", e.target.value)
							}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">6. Qo'shimcha telefon raqamingiz</label>
						<input
							required
							type="text"
							placeholder="998xxxxxxxxx"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['add_phone_number'] || ''}
							onChange={(e) => {
								handleChange("add_phone_number", e.target.value)
							}}
						/>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">7. Jinsingiz</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"gender"}
									value={"0"}
									checked={formData["gender"] === 1}
									onChange={() => handleChange("gender", 1)}
								/>
								<span>Erkak</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"gender"}
									value={"1"}
									checked={formData["gender"] === 0}
									onChange={() => handleChange("gender", 0)}
								/>
								<span>Ayol</span>
							</label>
						</div>
					</div>
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2" htmlFor="region">8. Hozir yashayotgan hududingiz
							(viloyat)</label>
						<select
							name={"region"}
							className="border border-gray-300 rounded px-3 py-2 w-full"
							value={formData["region"] || ''}
							onChange={(e) => {
								handleChange("region", e.target.value)
								setSelectedRegionId(e.target.value);
							}}
						>
							<option value="" disabled={formData["region"]}>{t('Tanlang')}</option>
							{regions?.map((el) => (
								<option key={el?.id} value={el?.id}>{el?.name}</option>
							))}
						</select>
					</div>
					{formData["region"] && (
						<div className="py-4 px-2 bg-white rounded">
							<label className="block font-semibold mb-2" htmlFor="region">8. Hozir yashayotgan hududingiz
								(tuman)</label>
							<select
								name={"district"}
								className="border border-gray-300 rounded px-3 py-2 w-full"
								value={formData["district"] || ''}
								onChange={(e) => handleChange("district", e.target.value)}
							>
								<option value="" disabled={formData["district"]}>{t('Tanlang')}</option>
								{districts?.map((el) => (
									<option key={el?.id} value={el?.id}>{el?.name}</option>
								))}
							</select>
						</div>
					)}
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">9. Ayni vaqtda qayerni tamomlaysiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"current_study_place"}
									value={"0"}
									checked={formData["current_study_place"] === 0}
									onChange={() => handleChange("current_study_place", 0)}
								/>
								<span>Maktab (11 sinf)</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"current_study_place"}
									value={1}
									checked={formData["current_study_place"] === 1}
									onChange={() => handleChange("current_study_place", 1)}
								/>
								<span>Texnikum</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"current_study_place"}
									value={1}
									checked={formData["current_study_place"] === 2}
									onChange={() => handleChange("current_study_place", 2)}
								/>
								<span>Oliy ta'lim muassasi</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">10. Ta'lim muassasangizni nomini yozing.</label>
						<input
							required
							type="text"
							placeholder="Ta'lim muassasangizni nomini yozing"
							className="w-full p-2 border border-gray-300 rounded"
							value={formData['educational_institution'] || ''}
							onChange={(e) => handleChange("educational_institution", e.target.value)}
						/>
					</div>
					
					{(formData["current_study_place"] === 1 || formData["current_study_place"] === 2) && (
						<>
							<div className="py-4 px-2 bg-white rounded">
								<label className="block font-semibold mb-2">11. Texnikumni qaysi yo'nalishda tamomlayapsiz?</label>
								{options.specialties && options.specialties?.map((el) => (
									<div key={el?.id} className="space-y-2">
										<label className="flex items-center gap-2">
											<input
												type="radio"
												name={"college_specialty"}
												value={el?.id}
												checked={formData["college_specialty"] === el?.id}
												onChange={() => handleChange("college_specialty", el?.id)}
											/>
											<span>{el?.name}</span>
										</label>
									</div>
								))}
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"college_specialty"}
											value={"5"}
											checked={formData["college_specialty"] === 5}
											onChange={() => handleChange("college_specialty", 5)}
										/>
										<span>Boshqa</span>
									</label>
								</div>
								{formData["college_specialty"] === 5 && (
									<div className="space-y-2">
										<input
											required
											type="text"
											placeholder="Sohani kiriting"
											className="w-full p-2 border border-gray-300 rounded"
											value={formData['custom_college_specialty'] || ''}
											onChange={(e) => handleChange("custom_college_specialty", e.target.value)}
										/>
									</div>
								)}
							</div>
							<div className="py-4 px-2 bg-white rounded">
								<label className="block font-semibold mb-2">12. Sohangiz bo‘yicha sizda qanday imkoniyatlar bor deb
									o‘ylaysiz?</label>
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"professional_readiness"}
											value={"0"}
											checked={formData["professional_readiness"] === 0}
											onChange={() => handleChange("professional_readiness", 0)}
										/>
										<span>Faqat diplomim bor, sohamni yaxshi bilmayman</span>
									</label>
								</div>
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"professional_readiness"}
											value={"1"}
											checked={formData["professional_readiness"] === 1}
											onChange={() => handleChange("professional_readiness", 1)}
										/>
										<span>O‘z sohamni yaxshi bilaman</span>
									</label>
								</div>
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"professional_readiness"}
											value={"2"}
											checked={formData["professional_readiness"] === 2}
											onChange={() => handleChange("professional_readiness", 2)}
										/>
										<span>Soham bo‘yicha tajribaga ham egaman</span>
									</label>
								</div>
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"professional_readiness"}
											value={"3"}
											checked={formData["professional_readiness"] === 3}
											onChange={() => handleChange("professional_readiness", 3)}
										/>
										<span>Soham bo‘yicha qo‘shimcha kursda o‘qiganman</span>
									</label>
								</div>
								<div className="space-y-2">
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name={"professional_readiness"}
											value={"4"}
											checked={formData["professional_readiness"] === 4}
											onChange={() => handleChange("professional_readiness", 4)}
										/>
										<span>Soham bo‘yicha qo‘shimcha kursda o‘qishni xohlayman</span>
									</label>
								</div>
							</div>
						</>
					)}
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">13. Maktab/Texnikum/OTMni tamomlagach nima qilmoqchisiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"0"}
									checked={formData["future_plan_after_graduation"] === 0}
									onChange={() => handleChange("future_plan_after_graduation", 0)}
								/>
								<span>O'qishni davom ettiraman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"1"}
									checked={formData["future_plan_after_graduation"] === 1}
									onChange={() => handleChange("future_plan_after_graduation", 1)}
								/>
								<span>O‘zbekistonda ishlamoqchiman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"2"}
									checked={formData["future_plan_after_graduation"] === 2}
									onChange={() => handleChange("future_plan_after_graduation", 2)}
								/>
								<span>Chet elga ishlashga ketmoqchiman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"3"}
									checked={formData["future_plan_after_graduation"] === 3}
									onChange={() => handleChange("future_plan_after_graduation", 3)}
								/>
								<span>Kasb-hunar o‘rganmoqchiman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"4"}
									checked={formData["future_plan_after_graduation"] === 4}
									onChange={() => handleChange("future_plan_after_graduation", 4)}
								/>
								<span>Hozircha aniq rejam yo'q</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"future_plan_after_graduation"}
									value={"5"}
									checked={formData["future_plan_after_graduation"] === 5}
									onChange={() => handleChange("future_plan_after_graduation", 5)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["future_plan_after_graduation"] === 5 && (
							<div className="space-y-2">
								<input
									required
									type="text"
									placeholder="Sohani kiriting"
									className="w-full p-2 border border-gray-300 rounded"
									value={formData['custom_future_plan_after_graduation'] || ''}
									onChange={(e) => handleChange("custom_future_plan_after_graduation", e.target.value)}
								/>
							</div>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">14. Agar o‘qishni rejalashtirayotgan bo‘lsangiz, qaysi sohada
							o‘qimoqchisiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"0"}
									checked={formData["intended_field_of_study"] === 0}
									onChange={() => handleChange("intended_field_of_study", 0)}
								/>
								<span>Tibbiyot</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"1"}
									checked={formData["intended_field_of_study"] === 1}
									onChange={() => handleChange("intended_field_of_study", 1)}
								/>
								<span>Muhandislik</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"2"}
									checked={formData["intended_field_of_study"] === 2}
									onChange={() => handleChange("intended_field_of_study", 2)}
								/>
								<span>Moliya/Iqtisod</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"3"}
									checked={formData["intended_field_of_study"] === 3}
									onChange={() => handleChange("intended_field_of_study", 3)}
								/>
								<span>Axborot texnologiyalari</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"4"}
									checked={formData["intended_field_of_study"] === 4}
									onChange={() => handleChange("intended_field_of_study", 4)}
								/>
								<span>San'at/yoshlar ishi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"intended_field_of_study"}
									value={"5"}
									checked={formData["intended_field_of_study"] === 5}
									onChange={() => handleChange("intended_field_of_study", 5)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["intended_field_of_study"] === 5 && (
							<div className="space-y-2">
								<input
									required
									type="text"
									placeholder="Sohani kiriting"
									className="w-full p-2 border border-gray-300 rounded"
									value={formData['custom_intended_field_of_study'] || ''}
									onChange={(e) => handleChange("custom_intended_field_of_study", e.target.value)}
								/>
							</div>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">15. Agar kasb-hunar o‘rganmoqchi bo‘lsangiz qaysi kasbni tanlar
							edingiz?</label>
						{options.professions && options.professions?.map((el) => (
							<div key={el?.id} className="space-y-2">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name={"optional_profession"}
										value={el?.id}
										checked={formData["optional_profession"] === el?.id}
										onChange={() => handleChange("optional_profession", el?.id)}
									/>
									<span>{el?.name}</span>
								</label>
							</div>
						))}
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"optional_profession"}
									value={5}
									checked={formData["optional_profession"] === 5}
									onChange={() => handleChange("optional_profession", 5)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["optional_profession"] === 5 && (
							<div className="space-y-2">
								<input
									required
									type="text"
									placeholder="Sohani kiriting"
									className="w-full p-2 border border-gray-300 rounded"
									value={formData['custom_optional_profession'] || ''}
									onChange={(e) => handleChange("custom_optional_profession", e.target.value)}
								/>
							</div>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">16. Qaysi xorijiy tilni bilasiz?</label>
						{options.languages && options.languages?.map((el) => (
							<div key={el?.id} className="space-y-2">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name={"known_languages"}
										value={el?.id}
										checked={formData["known_languages"] === el?.id}
										onChange={() => handleChange("known_languages", el?.id)}
									/>
									<span>{el?.name}</span>
								</label>
							</div>
						))}
						
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"known_languages"}
									value={'Boshqa'}
									checked={formData["known_languages"] === 'Boshqa'}
									onChange={() => handleChange("known_languages", 'Boshqa')}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["known_languages"] === 'Boshqa' && (
							<div className="space-y-2">
								<input
									required
									type="text"
									placeholder="Xorijiy tilni kiriting"
									className="w-full p-2 border border-gray-300 rounded"
									value={formData['custom_known_languages'] || ''}
									onChange={(e) => handleChange("custom_known_languages", e.target.value)}
								/>
							</div>
						)}
						{formData["known_languages"] && formData["known_languages"] !== HECH_BIRINI_ID && (
							<>
								<label className="block font-semibold my-2" htmlFor="language_level">Til bilish darajangizni tanlang</label>
								<select
									name={"language_level"}
									className="border border-gray-300 rounded px-3 py-2 w-full"
									value={formData["language_level"] || ''}
									onChange={(e) => {
										handleChange("language_level", e.target.value)
									}}
								>
									<option value="" disabled={formData["language_level"]}>{t('Tanlang')}</option>
									<option value="A1">A1</option>
									<option value="A2">A2</option>
									<option value="B1">B1</option>
									<option value="B2">B2</option>
									<option value="C1">C1</option>
									<option value="C2">C2</option>
								</select>
							</>
						)}
						
						{/*{renderMultipleCheckboxGroup(*/}
						{/*	'known_languages',*/}
						{/*	[...options.languages, {id: 'Boshqa', name: 'Boshqa'}],*/}
						{/*	"16. Qaysi xorijiy tilni bilasiz? (bittadan ko’p javobni tanlashingiz mumkin)"*/}
						{/*)}*/}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">17. Qaysi tilni o'rganmoqchisiz?</label>
						{options.languages && options.languages?.map((el) => (
							<div key={el?.id} className="space-y-2">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name={"desired_languages"}
										value={el?.id}
										checked={formData["desired_languages"] === el?.id}
										onChange={() => handleChange("desired_languages", el?.id)}
									/>
									<span>{el?.name}</span>
								</label>
							</div>
						))}
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"desired_languages"}
									value={5}
									checked={formData["desired_languages"] === 5}
									onChange={() => handleChange("desired_languages", 5)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["desired_languages"] === 5 && (
							<div className="space-y-2">
								<input
									required
									type="text"
									placeholder="Sohani kiriting"
									className="w-full p-2 border border-gray-300 rounded"
									value={formData['custom_desired_languages'] || ''}
									onChange={(e) => handleChange("custom_desired_languages", e.target.value)}
								/>
							</div>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">18. Chet elda ishlash haqida o‘ylaganmisiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_work_interest"}
									value={"0"}
									checked={formData["abroad_work_interest"] === 0}
									onChange={() => handleChange("abroad_work_interest", 0)}
								/>
								<span>Ha, jiddiy o'ylayapman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_work_interest"}
									value={"1"}
									checked={formData["abroad_work_interest"] === 1}
									onChange={() => handleChange("abroad_work_interest", 1)}
								/>
								<span>Ha, lekin yetarli maʼlumotga ega emasman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_work_interest"}
									value={"2"}
									checked={formData["abroad_work_interest"] === 2}
									onChange={() => handleChange("abroad_work_interest", 2)}
								/>
								<span>Ha, lekin faqat ishonchli va rasmiy ish taklif qilinsa</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_work_interest"}
									value={"3"}
									checked={formData["abroad_work_interest"] === 3}
									onChange={() => handleChange("abroad_work_interest", 3)}
								/>
								<span>Yo‘q, bunday rejam yo‘q</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">19. Agar ishlashni rejalashtirayotgan bo‘lsangiz, qaysi sohada
							ishlar edingiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"0"}
									checked={formData["planned_job"] === 0}
									onChange={() => handleChange("planned_job", 0)}
								/>
								<span>Hamshira</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"1"}
									checked={formData["planned_job"] === 1}
									onChange={() => handleChange("planned_job", 1)}
								/>
								<span>Quruvchi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"2"}
									checked={formData["planned_job"] === 2}
									onChange={() => handleChange("planned_job", 2)}
								/>
								<span>Haydovchi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"3"}
									checked={formData["planned_job"] === 3}
									onChange={() => handleChange("planned_job", 3)}
								/>
								<span>Oshpaz</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"4"}
									checked={formData["planned_job"] === 4}
									onChange={() => handleChange("planned_job", 4)}
								/>
								<span>Dasturchi/axborot texnologiyalari sohasi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"5"}
									checked={formData["planned_job"] === 5}
									onChange={() => handleChange("planned_job", 5)}
								/>
								<span>Tikuvchi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"6"}
									checked={formData["planned_job"] === 6}
									onChange={() => handleChange("planned_job", 6)}
								/>
								<span>Ishlab chiqarish</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"planned_job"}
									value={"7"}
									checked={formData["planned_job"] === 7}
									onChange={() => handleChange("planned_job", 7)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						{formData["planned_job"] === 7 && (
							<input
								type="text"
								className="mt-2 w-full border border-gray-300 p-2 rounded"
								placeholder="Iltimos, aniqlashtiring"
								value={formData[`custom_planned_job`] || ''}
								onChange={(e) => handleChange(`custom_planned_job`, e.target.value)}
							/>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">20. Ota-onangiz sizning xorijga chiqishingizga qanday
							munosabatda?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"parent_support_abroad"}
									value={"0"}
									checked={formData["parent_support_abroad"] === 0}
									onChange={() => handleChange("parent_support_abroad", 0)}
								/>
								<span>To‘liq qo‘llab-quvvatlaydi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"parent_support_abroad"}
									value={"1"}
									checked={formData["parent_support_abroad"] === 1}
									onChange={() => handleChange("parent_support_abroad", 1)}
								/>
								<span>Qarshi emas, lekin xavotirda</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"parent_support_abroad"}
									value={"2"}
									checked={formData["parent_support_abroad"] === 2}
									onChange={() => handleChange("parent_support_abroad", 2)}
								/>
								<span>Qarshi</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"parent_support_abroad"}
									value={"3"}
									checked={formData["parent_support_abroad"] === 3}
									onChange={() => handleChange("parent_support_abroad", 3)}
								/>
								<span>Oʻz fikrini bildirishmagan</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						{renderMultipleCheckboxGroup(
							'fears_abroad',
							[...options.fears_abroad],
							"21. Agar chet elda ishlasangiz, quyidagilardan eng ko‘p nimadan qo‘rqasiz? (Bir nechtasini belgilang)"
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">22. Ota-onangiz yoki yaqinlaringiz xorijda ishlayaptimi?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"family_abroad_status"}
									value={"0"}
									checked={formData["family_abroad_status"] === 0}
									onChange={() => handleChange("family_abroad_status", 0)}
								/>
								<span>Ha, otam</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"family_abroad_status"}
									value={"4"}
									checked={formData["family_abroad_status"] === 4}
									onChange={() => handleChange("family_abroad_status", 4)}
								/>
								<span>Ha, onam</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"family_abroad_status"}
									value={"1"}
									checked={formData["family_abroad_status"] === 1}
									onChange={() => handleChange("family_abroad_status", 1)}
								/>
								<span>Ha, ikkisi ham</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"family_abroad_status"}
									value={"2"}
									checked={formData["family_abroad_status"] === 2}
									onChange={() => handleChange("family_abroad_status", 2)}
								/>
								<span>Yo'q</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"family_abroad_status"}
									value={"3"}
									checked={formData["family_abroad_status"] === 3}
									onChange={() => handleChange("family_abroad_status", 3)}
								/>
								<span>Avval ishlagan, hozir yo'q</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">23. Agar ishlash uchun chet elga borsangiz, qaysi davlatni
							tanlardingiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"0"}
									checked={formData["preferred_country"] === 0}
									onChange={() => handleChange("preferred_country", 0)}
								/>
								<span>Rossiya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"1"}
									checked={formData["preferred_country"] === 1}
									onChange={() => handleChange("preferred_country", 1)}
								/>
								<span>Janubiy Koreya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"2"}
									checked={formData["preferred_country"] === 2}
									onChange={() => handleChange("preferred_country", 2)}
								/>
								<span>Germaniya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"3"}
									checked={formData["preferred_country"] === 3}
									onChange={() => handleChange("preferred_country", 3)}
								/>
								<span>Buyuk Britaniya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"4"}
									checked={formData["preferred_country"] === 4}
									onChange={() => handleChange("preferred_country", 4)}
								/>
								<span>Yaponiya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"5"}
									checked={formData["preferred_country"] === 5}
									onChange={() => handleChange("preferred_country", 5)}
								/>
								<span>Turkiya</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"preferred_country"}
									value={"6"}
									checked={formData["preferred_country"] === 6}
									onChange={() => handleChange("preferred_country", 6)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						
						{formData["preferred_country"] === 6 && (
							<input
								type="text"
								className="mt-2 w-full border border-gray-300 p-2 rounded"
								placeholder="Iltimos, aniqlashtiring"
								value={formData[`custom_preferred_country`] || ''}
								onChange={(e) => handleChange(`custom_preferred_country`, e.target.value)}
							/>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">24. Xorijda qancha miqdorda oylik olishni hohlar
							edingiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"expected_salary"}
									value={"0"}
									checked={formData["expected_salary"] === 0}
									onChange={() => handleChange("expected_salary", 0)}
								/>
								<span>1000 – 2000 AQSh dollari</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"expected_salary"}
									value={"1"}
									checked={formData["expected_salary"] === 1}
									onChange={() => handleChange("expected_salary", 1)}
								/>
								<span>2000 – 3000 AQSh dollari</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"expected_salary"}
									value={"2"}
									checked={formData["expected_salary"] === 2}
									onChange={() => handleChange("expected_salary", 2)}
								/>
								<span>3000 AQSh dollaridan yuqori</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">25. Xorijda mavjud bo‘sh ish o‘rinlari haqidagi ma’lumotlarni
							qayerdan olasiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"job_info_source"}
									value={"0"}
									checked={formData["job_info_source"] === 0}
									onChange={() => handleChange("job_info_source", 0)}
								/>
								<span>Ijtimoiy tarmoqlar orqali</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"job_info_source"}
									value={"1"}
									checked={formData["job_info_source"] === 1}
									onChange={() => handleChange("job_info_source", 1)}
								/>
								<span>Qidiruv saytlari orqali</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"job_info_source"}
									value={"2"}
									checked={formData["job_info_source"] === 2}
									onChange={() => handleChange("job_info_source", 2)}
								/>
								<span>Xalqaro bo‘sh ish o‘rinlari platformalari (LinkedIn, HH.ru, Indeed, Glassdoor va h.k)</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"job_info_source"}
									value={"3"}
									checked={formData["job_info_source"] === 3}
									onChange={() => handleChange("job_info_source", 3)}
								/>
								<span>Migratsiya Agentligi rasmiy sahifalaridan (xorijdaish.uz)</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"job_info_source"}
									value={"6"}
									checked={formData["job_info_source"] === 6}
									onChange={() => handleChange("job_info_source", 6)}
								/>
								<span>Boshqa</span>
							</label>
						</div>
						
						{formData["job_info_source"] === 6 && (
							<input
								type="text"
								className="mt-2 w-full border border-gray-300 p-2 rounded"
								placeholder="Iltimos, aniqlashtiring"
								value={formData[`custom_job_info_source`] || ''}
								onChange={(e) => handleChange(`custom_job_info_source`, e.target.value)}
							/>
						)}
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">26. Agar siz xorijda yurganingizda muvaffaqiyatsizlikka
							uchrasangiz,
							nima qilasiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"failure_response"}
									value={"0"}
									checked={formData["failure_response"] === 0}
									onChange={() => handleChange("failure_response", 0)}
								/>
								<span>Vatanga qaytaman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"failure_response"}
									value={"1"}
									checked={formData["failure_response"] === 1}
									onChange={() => handleChange("failure_response", 1)}
								/>
								<span>Yordam so‘rayman va davom etaman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"failure_response"}
									value={"2"}
									checked={formData["failure_response"] === 2}
									onChange={() => handleChange("failure_response", 2)}
								/>
								<span>Yangi yo'llarni izlayman</span>
							</label>
						</div>
					</div>
					
					<div className="py-4 px-2 bg-white rounded">
						<label className="block font-semibold mb-2">27. Agar sizga imkoniyat berilsa, 1 yil ichida xorijga chiqib
							ishlashga tayyormisiz?</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_opportunity"}
									value={"0"}
									checked={formData["abroad_opportunity"] === 0}
									onChange={() => handleChange("abroad_opportunity", 0)}
								/>
								<span>Ha, to'liq tayyorman</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_opportunity"}
									value={"1"}
									checked={formData["abroad_opportunity"] === 1}
									onChange={() => handleChange("abroad_opportunity", 1)}
								/>
								<span>Xorijiy tilni o'rganishim kerak</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_opportunity"}
									value={"2"}
									checked={formData["abroad_opportunity"] === 2}
									onChange={() => handleChange("abroad_opportunity", 2)}
								/>
								<span>Kasb-hunar o'rganishim kerak</span>
							</label>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name={"abroad_opportunity"}
									value={"3"}
									checked={formData["abroad_opportunity"] === 3}
									onChange={() => handleChange("abroad_opportunity", 3)}
								/>
								<span>Yo'q, hozircha rejam yo'q</span>
							</label>
						</div>
					</div>
					
					<button
						type="submit"
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex justify-center mx-auto"
					>
						{t('Yuborish') || 'Yuborish'}
					</button>
				</form>
			</div>
		</main>
	);
};

export default Main;
