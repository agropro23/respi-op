import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Calendar, Clock, Pill, Plus, File, Download, Eye } from 'lucide-react';
import Prescription from './Prescription';
import { jsPDF } from 'jspdf';
import { translateText, localizeDigits } from '../../utils/translationUtils';
import html2canvas from 'html2canvas';
import { apiFetch } from '../../utils/api'; 

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function PatientPrescriptions() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patient, setPatient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const patientResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`);
                if (!patientResponse.ok) throw new Error('Failed to fetch patient');
                const patientData = await patientResponse.json();
                setPatient(patientData);

                const prescriptionResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/prescriptions/patient/${patientId}`);
                if (!prescriptionResponse.ok) throw new Error('Failed to fetch prescriptions');
                const prescriptionData = await prescriptionResponse.json();
                setPrescriptions(prescriptionData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [patientId]);

    useEffect(() => {
        if (location.state && location.state.printNow && location.state.printPrescription) {
            // Call handleViewPDF with the prescription data
            const lang = (location.state && location.state.printLanguage) || (location.state && location.state.printPrescription && location.state.printPrescription.printLanguage) || 'english';
            handleViewPDF(location.state.printPrescription, patient, lang);
            // Clear the state to prevent repeated triggers
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    const handleEdit = (prescription) => {
        setSelectedPrescription(prescription);
        setShowEditModal(true);
    };

    const handleAddNewPrescription = () => {
        setSelectedPrescription(null);
        setShowEditModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) return <div>Loading prescriptions...</div>;
    if (error) return <div>Error: {error}</div>;

    const getTimingPattern = (timings) => {
        const order = ['morning', 'afternoon', 'evening', 'night'];
        const labels = {
            morning: 'Morning',
            afternoon: 'Afternoon',
            evening: 'Evening',
            night: 'Night',
        };
        return order.filter(key => timings[key]).map(key => labels[key]).join('-') || 'None';
    };

    const handleCloseModal = async (savedPrescription) => {
        setShowEditModal(false);
        setSelectedPrescription(null);

        try {
            const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/prescriptions/patient/${patientId}`);
            const data = await response.json();
            setPrescriptions(data);
        } catch (err) {
            setError('Failed to refresh prescriptions');
        }
    };

    const formatInstructions = (instructions, skipOther = true) => {
        const labels = [];
        if (instructions.beforeFood) labels.push('Before Food');
        if (instructions.afterFood) labels.push('After Food');
        if (instructions.withFood) labels.push('With Food');
        if (!skipOther && instructions.other) labels.push(instructions.other);
        return labels.length > 0 ? labels.join(', ') : '';
    };

    const getPaperDimensions = (paperSize) => {
        if (paperSize === 'Small') {
            return { width: '148mm', height: '210mm' }; // A5
        }
        return { width: '210mm', height: '297mm' }; // A4
    };

    // Format-specific functions
    async function generateA4WithLetterhead({ prescription, patient, lang, width, height }) {
        const t = async (text) => lang === 'english' ? text : await translateText(text, lang);
        const d = (val) => localizeDigits(val, lang);
        const patientName = patient?.basicInfo?.name || '';
        const patientAge = patient?.basicInfo?.age || '';
        const patientSex = patient?.basicInfo?.sex || '';
        const patientContact = patient?.basicInfo?.tel1 || (patient?.basicInfo?.tel2 || '');
        const patientRefBy = patient?.basicInfo?.refBy || '';
        const translatedMedicines = await Promise.all(prescription.medicines.map(async (m) => ({
            ...m,
          medicineName: m.medicineName,
          dosage: d(m.dosage),
          dosageRaw: m.dosage,
            duration: d(m.duration.toString()),
            durationRaw: m.duration,
            instructionsText: lang === 'english'
                ? formatInstructions(m.instructions, false)
                : await translateText(formatInstructions(m.instructions, false), lang),
            rawInstructions: m.instructions,
            isBelow: m.isBelow,
            timings: m.timings
        })));
        const timingMap = {
          morning: await t('Morning'),
          afternoon: await t('Afternoon'),
          evening: await t('Evening'),
          night: await t('Night'),
        };
        const noneLabel = lang === 'english' ? 'None' : await t('None');
        const getTimingPatternLocalized = (timings) => {
          const order = ['morning', 'afternoon', 'evening', 'night'];
          return order.filter(key => timings[key]).map(key => timingMap[key]).join('-') || noneLabel;
        };
        const daysLabel = await t('days');
        const hasCustomInstruction = prescription.medicines.some(m => !m.isBelow && m.instructions && m.instructions.other && m.instructions.other.trim());
        const timingColumnHeader = await t(hasCustomInstruction ? 'Instruction' : 'Timing');
        const nextVisitLabel = await t('Next Visit in ');
        const followUpUnitLabel = await t(prescription.followUp.unit);
        let dateLabel = 'Date:';
        let dateValue = new Date(prescription.prescriptionDate).toLocaleDateString();
        const otherInstructions = translatedMedicines
            .filter(m => m.isBelow && m.instructionsText)
            .map(m => `${m.medicineName}: ${m.instructionsText}`);
        if (prescription.commonBelowInstruction && prescription.commonBelowInstruction.trim()) {
            const translatedCommon = lang === 'english'
                ? prescription.commonBelowInstruction.trim()
                : await translateText(prescription.commonBelowInstruction.trim(), lang);
            otherInstructions.push(translatedCommon);
        }
      const doctorName = prescription.selectedDoctor || 'DR. VIPUL SHAH';
  
        return `
        <div id="prescription-content" style="width: ${width}; height: ${height}; display: flex; flex-direction: column; justify-content: space-between; padding: 24px; font-family: 'Montserrat', sans-serif; box-sizing: border-box; background: white; color: #374151; position: relative; margin: 0;">
                <!-- HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="flex: 0 0 auto;">
              <img src="/3.jpg" height="120px" width="150px" alt="Respicure Logo" style="margin-left: -4px; margin-top: -10px;" />
                  </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 210px;">
              <div style="font-weight: 800; font-size: 15px; letter-spacing: 1px; text-align: center;">DR. ESHITA V. SHAH</div>
              <div style="text-align: left; width: 100%; margin-left: 15%;">
                <p style="margin: 2px 0; font-size: 11px;">M.D (Pulmonary Medicine)</p>
                <p style="margin: 2px 0; font-size: 11px;">EDRM, FIP</p>
                <p style="margin: 2px 0; font-size: 11px;">Interventional Pulmonology</p>
                <p style="margin: 2px 0; font-size: 11px;">& Thoracic Oncology (New Delhi)</p>
                    </div>
                    </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 170px; margin-left: 6%;">
              <div style="font-weight: 800; font-size: 15px; letter-spacing: 1px; text-align: center;">DR. VIPUL SHAH</div>
              <div style="text-align: right; width: 100%; margin-right: 23%;">
                <p style="margin: 1px 0; font-size: 11px;">MBSACI, DAAI (USA), PHD (Allergy)</p>
                <p style="margin: 1px 0; font-size: 11px;">Specialist in Allergy & Asthma</p>
                <p style="margin: 1px 0; font-size: 11px;">Tel : 0261-2464747</p>
                <p style="margin: 1px 0; font-size: 11px;">Mo. 9824124747</p>
                  </div>
                    </div>
            <div style="flex: 0 0 auto;">
              <img src="/image_half.png" height="120px" width="150px" alt="Chest Logo" style="margin-right: 0px; margin-top: -22px;" />
                    </div>
                  </div>
          <div style="height: 2px; background-color: #8B0000; margin: 6px 0;"></div>
          <div style="text-align: right; font-size: 15px; padding: 0 12px; margin-bottom: 6px;"><strong>${dateLabel}</strong> ${dateValue}</div>
          <!-- BODY -->
          <div style="flex-grow: 1; padding: 0 24px; margin-bottom: 70px;">
            <section style="margin-bottom: 16px; font-size: 16px; position: relative;">
              <p style="margin: 2px 0;"><strong>Name:</strong> ${patientName}</p>
              <p style="margin: 2px 0;"><strong>Age/Sex:</strong> ${patientAge}/${patientSex}</p>
            </section>
            <section style="margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                <thead>
                  <tr style="background-color: rgb(126, 148, 171);">
                    <th style="padding: 6px 8px; text-align: left; font-size: 16px;">Medicine</th>
                    <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Dosage</th>
                    <th style="padding: 6px 8px; text-align: center; font-size: 16px;">${timingColumnHeader}</th>
                    <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Duration</th>
                    <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${translatedMedicines.map((m, i) => `
                  <tr style="font-size: 14px; border-bottom: 1px solid black;">
                    <td style="padding: 6px 8px;">${m.medicineName}</td>
                    <td style="padding: 6px 8px; text-align: center;">${m.dosage}</td>
                    <td style="padding: 6px 8px; text-align: center;">${!m.isBelow && m.rawInstructions?.other && m.rawInstructions.other.trim() !== '' ? escapeHtml(m.rawInstructions.other) : getTimingPatternLocalized(m.timings)}</td>
                    <td style="padding: 6px 8px; text-align: center;">${m.duration} ${daysLabel}</td>
                    <td style="padding: 6px 8px; text-align: center;">${m.quantity ? d(m.quantity.toString()) : d(calculateQty(m.dosageRaw || m.dosage, m.timings, m.durationRaw || m.duration))}</td>
                  </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>
            <section style="font-size: 13px; margin-bottom: 16px;">
              ${prescription.additionalNotes ? `<p><strong>Advice:</strong> ${prescription.additionalNotes}</p>` : ''}
              ${prescription.tests ? `<p><strong>Tests:</strong> ${prescription.tests}</p>` : ''}
              ${otherInstructions.length > 0 ? `
                <div style="margin-top: 8px; margin-bottom: 12px;">
                  <strong>Other Instructions:</strong>
                  <ul style="margin: 4px 0 0 16px; padding: 0; list-style-position: outside;">
                    ${otherInstructions.map(instr => `<li style="margin-bottom: 4px;">${escapeHtml(instr)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <p><strong>${nextVisitLabel} ${d(prescription.followUp.duration)} ${followUpUnitLabel}</strong></p>
            </section>
            <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; margin-top: 70%;">
              <p style="margin: 2px 0 0; font-size: 16px;">${doctorName}</p>
            </div>
          </div>
          <div style="height: 80px;"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 100%; color: #374151;">
            <div style="font-weight: 500; font-size: 10px; background-color: white; padding: 5px 24px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; margin-right: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 2px; vertical-align: middle;"><rect x="2" y="4" width="20" height="16" fill="#888"/><polyline points="2,4 12,14 22,4" style="fill:none;stroke:#fff;stroke-width:2"/></svg>
                <span>respicure@dreshitashah.com</span>
              </span>
              <span style="display: inline-flex; align-items: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 2px; vertical-align: middle;"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5" fill="none"/><path d="M12 2c2.5 2.5 2.5 15.5 0 18M12 2C9.5 4.5 9.5 17.5 12 20M4 12h16" stroke="#888" stroke-width="1.5" fill="none"/></svg>
                <span>www.dreshitashah.com</span>
              </span>
            </div>
            <footer style="background-color: #D8BFD8; padding: 10px 0; text-align: center; width: calc(100% + 48px); position: relative; left: -24px; box-sizing: border-box;">
              <p style="font-weight: 500; font-size: 10px; margin: 0; line-height: 1.4;">
                FOR APPOINTMENT: +91 93166 33039<br/>
                102, VISHWAKARMA CHAMBER, NR. VISHWAKARMA MANDIR, MAJURA GATE RING ROAD, SURAT-395002
            </footer>
          </div>
        </div>
      `;
  }

    async function generateA4WithoutLetterhead({ prescription, patient, lang, width, height }) {
        // Same as A4WithLetterhead but with header/footer blocks (no letterhead, add footer)
        const t = async (text) => lang === 'english' ? text : await translateText(text, lang);
        const d = (val) => localizeDigits(val, lang);
        const patientName = patient?.basicInfo?.name || '';
        const patientAge = patient?.basicInfo?.age || '';
        const patientSex = patient?.basicInfo?.sex || '';
        const patientContact = patient?.basicInfo?.tel1 || (patient?.basicInfo?.tel2 || '');
        const patientRefBy = patient?.basicInfo?.refBy || '';
        const translatedMedicines = await Promise.all(prescription.medicines.map(async (m) => ({
            ...m,
            medicineName: m.medicineName,
            dosage: d(m.dosage),
            dosageRaw: m.dosage,
            duration: d(m.duration.toString()),
            durationRaw: m.duration,
            instructionsText: lang === 'english'
                ? formatInstructions(m.instructions, false)
                : await translateText(formatInstructions(m.instructions, false), lang),
            rawInstructions: m.instructions,
            isBelow: m.isBelow,
            timings: m.timings
        })));
        const timingMap = {
            morning: await t('Morning'),
            afternoon: await t('Afternoon'),
            evening: await t('Evening'),
            night: await t('Night'),
        };
        const noneLabel = lang === 'english' ? 'None' : await t('None');
        const getTimingPatternLocalized = (timings) => {
            const order = ['morning', 'afternoon', 'evening', 'night'];
            return order.filter(key => timings[key]).map(key => timingMap[key]).join('-') || noneLabel;
        };
        const daysLabel = await t('days');
        const hasCustomInstruction = prescription.medicines.some(m => !m.isBelow && m.instructions && m.instructions.other && m.instructions.other.trim());
        const timingColumnHeader = await t(hasCustomInstruction ? 'Instruction' : 'Timing');
        const nextVisitLabel = await t('Next Visit in ');
        const followUpUnitLabel = await t(prescription.followUp.unit);
        let dateLabel = 'Date:';
        let dateValue = new Date(prescription.prescriptionDate).toLocaleDateString();
        const otherInstructions = translatedMedicines
            .filter(m => m.isBelow && m.instructionsText)
            .map(m => `${m.medicineName}: ${m.instructionsText}`);
        if (prescription.commonBelowInstruction && prescription.commonBelowInstruction.trim()) {
            const translatedCommon = lang === 'english'
                ? prescription.commonBelowInstruction.trim()
                : await translateText(prescription.commonBelowInstruction.trim(), lang);
            otherInstructions.push(translatedCommon);
        }
        const doctorName = prescription.selectedDoctor || 'DR. VIPUL SHAH';
        return `
          <div id="prescription-content" style="width: ${width}; height: ${height}; display: flex; flex-direction: column; justify-content: space-between; padding: 24px; font-family: 'Montserrat', sans-serif; box-sizing: border-box; background: white; color: #374151; position: relative; margin: 0;">
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0px; margin-bottom: 6px;">
              <div style="flex: 0 0 auto;">
                <img src="" height="120px" width="150px"  style="margin-left: -4px; margin-top: -10px;" />
              </div>
              <div style="flex: 1; margin-top: 0; display: flex; flex-direction: column; align-items: center; min-width: 210px;">
                <div style="font-weight: 800; font-size: 15px; letter-spacing: 1px; text-align: center;"></div>
                <div style="text-align: left; width: 100%; margin-left: 15%; ">
                  <p style="margin: 2px 0; font-size: 11px;"></p>
                  <p style="margin: 2px 0; font-size: 11px;"></p>
                  <p style="margin: 2px 0; font-size: 11px;"></p>
                  <p style="margin: 2px 0; font-size: 11px;"></p>
                </div>
              </div>
              <div style="flex: 1; margin-top: 0; display: flex; flex-direction: column; align-items: center; min-width: 170px; margin-left: 6% ">
                <div style="font-weight: 800; font-size: 15px; letter-spacing: 1px; text-align: center; "></div>
                <div style="text-align: right; width: 100%; margin-right: 23%;">
                  <p style="margin: 1px 0; font-size: 11px;"></p>
                  <p style="margin: 1px 0; font-size: 11px;"></p>
                  <p style="margin: 1px 0; font-size: 11px;"></p>
                  <p style="margin: 1px 0; font-size: 11px;"></p>
                </div>
              </div>
              <div style="flex: 0 0 auto;">
                <img src="" height="120px" width="150px" style="margin-right: 0px; margin-top: 0px;" />
              </div>
            </div>
            <div style="text-align: right; font-size: 15px; margin-top: -1px; padding: 0 12px;"><strong>${dateLabel}</strong> ${dateValue}</div>
            <!-- BODY -->
            <div style="flex-grow: 1; padding: 0px 24px; margin-bottom: 70px;">
              <section style="margin-bottom: 16px; font-size: 16px; position: relative;">
                
                <p style="margin: 2px 0;"><strong>Name:</strong> ${patientName}</p>
                <p style="margin: 2px 0;"><strong>Age/Sex:</strong> ${patientAge}/${patientSex}</p>
              </section>
              <section style="margin-bottom: 30px; margin-top: 30px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                  <thead>
                    <tr style=" background-color:rgb(126, 148, 171);">
                      <th style="padding: 6px 8px; text-align: left; font-size: 16px;">Medicine</th>
                      <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Dosage</th>
                      <th style="padding: 6px 8px; text-align: center; font-size: 16px;">${timingColumnHeader}</th>
                      <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Duration</th>
                      <th style="padding: 6px 8px; text-align: center; font-size: 16px;">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${translatedMedicines.map((m, i) => `
                    <tr style="font-size: 14px; border-bottom: 1px solid black;">
                      <td style="padding: 6px 8px;">${m.medicineName}</td>
                      <td style="padding: 6px 8px; text-align: center;">${m.dosage}</td>
                      <td style="padding: 6px 8px; text-align: center;">${!m.isBelow && m.rawInstructions?.other && m.rawInstructions.other.trim() !== '' ? escapeHtml(m.rawInstructions.other) : getTimingPatternLocalized(m.timings)}</td>
                      <td style="padding: 6px 8px; text-align: center;">${m.duration} ${daysLabel}</td>
                      <td style="padding: 6px 8px; text-align: center;">${m.quantity ? d(m.quantity.toString()) : d(calculateQty(m.dosageRaw || m.dosage, m.timings, m.durationRaw || m.duration))}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </section>
              <section style="font-size: 13px; margin-bottom: 16px;">
                ${prescription.additionalNotes ? `<p><strong>Advice:</strong> ${prescription.additionalNotes}</p>` : ''}
                ${prescription.tests ? `<p><strong>Tests:</strong> ${prescription.tests}</p>` : ''}
                ${otherInstructions.length > 0 ? `
                  <div style="margin-top: 8px; margin-bottom: 12px;">
                    <strong>Other Instructions:</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                      ${otherInstructions.map(instr => `<li style="margin-bottom: 4px;">${escapeHtml(instr)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <p><strong>${nextVisitLabel} ${d(prescription.followUp.duration)} ${followUpUnitLabel}</strong></p>
              </section>
              <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; margin-top: 80%;">
                <p style="margin: 2px 0 0; font-size: 16px;">${doctorName}</p>
              </div>
            </div>
            <div style="height: 80px;"></div>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; color: #374151;">
              <div style="font-weight: 500; font-size: 10px; background-color: white; padding: 5px 24px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; margin-right: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><rect x="2" y="4" width="20" height="16" fill="#888"/><polyline points="2,4 12,14 22,4" style="fill:none;stroke:#fff;stroke-width:2"/></svg>
                  <span>respicure@dreshitashah.com</span>
                </span>
                <span style="display: inline-flex; align-items: center;">
                  <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5" fill="none"/><path d="M12 2c2.5 2.5 2.5 15.5 0 18M12 2C9.5 4.5 9.5 17.5 12 20M4 12h16" stroke="#888" stroke-width="1.5" fill="none"/></svg>
                  <span>www.dreshitashah.com</span>
                </span>
              </div>
              <footer style="background-color:rgb(255, 255, 255); padding: 10px 0; text-align: center; width: calc(100% + 48px); position: relative; left: -24px; box-sizing: border-box;">
                <p style="font-weight: 600; font-size: 11px; margin: 0;">
                </p>
              </footer>
            </div>
          </div>
        `;
    }


async function generateSmallWithLetterhead({ prescription, patient, lang, width, height }) {
    // Like A4WithLetterhead but with small paper size and smaller header
    const t = async (text) => lang === 'english' ? text : await translateText(text, lang);
    const d = (val) => localizeDigits(val, lang);
    const patientName = patient?.basicInfo?.name || '';
    const patientAge = patient?.basicInfo?.age || '';
    const patientSex = patient?.basicInfo?.sex || '';
    const patientContact = patient?.basicInfo?.tel1 || (patient?.basicInfo?.tel2 || '');
    const patientRefBy = patient?.basicInfo?.refBy || '';
    const translatedMedicines = await Promise.all(prescription.medicines.map(async (m) => ({
        ...m,
        medicineName: m.medicineName,
        dosage: d(m.dosage),
        dosageRaw: m.dosage,
        duration: d(m.duration.toString()),
        durationRaw: m.duration,
        instructionsText: lang === 'english'
            ? formatInstructions(m.instructions, false)
            : await translateText(formatInstructions(m.instructions, false), lang),
        rawInstructions: m.instructions,
        isBelow: m.isBelow,
        timings: m.timings
    })));
    const timingMap = {
        morning: await t('Morning'),
        afternoon: await t('Afternoon'),
        evening: await t('Evening'),
        night: await t('Night'),
    };
    const noneLabel = lang === 'english' ? 'None' : await t('None');
    const getTimingPatternLocalized = (timings) => {
        const order = ['morning', 'afternoon', 'evening', 'night'];
        return order.filter(key => timings[key]).map(key => timingMap[key]).join('-') || noneLabel;
    };
    const daysLabel = await t('days');
    const hasCustomInstruction = prescription.medicines.some(m => !m.isBelow && m.instructions && m.instructions.other && m.instructions.other.trim());
    const timingColumnHeader = await t(hasCustomInstruction ? 'Instruction' : 'Timing');
    const nextVisitLabel = await t('Next Visit in ');
    const followUpUnitLabel = await t(prescription.followUp.unit);
    let dateLabel = 'Date:';
    let dateValue = new Date(prescription.prescriptionDate).toLocaleDateString();
    const otherInstructions = translatedMedicines
        .filter(m => m.isBelow && m.instructionsText)
        .map(m => `${m.medicineName}: ${m.instructionsText}`);
    if (prescription.commonBelowInstruction && prescription.commonBelowInstruction.trim()) {
        const translatedCommon = lang === 'english'
            ? prescription.commonBelowInstruction.trim()
            : await translateText(prescription.commonBelowInstruction.trim(), lang);
        otherInstructions.push(translatedCommon);
    }
    const doctorName = prescription.selectedDoctor || 'DR. VIPUL SHAH';
    return `
    <div id="prescription-content" style="width: ${width}; height: ${height}; display: flex; flex-direction: column; justify-content: space-between; padding: 16px; font-family: 'Montserrat', sans-serif; box-sizing: border-box; background: white; color: #374151; position: relative; margin: 0;">
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; min-height: 90px;">
      <div style="flex: 0 0 auto;">
        <img src="/3.jpg" height="80px" width="90px" alt="Respicure Logo" style="margin-left: -4px;" />
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 100px;">
        <div style="font-weight: 800; font-size: 12px; letter-spacing: 1px; text-align: center; margin-left: -5px;">DR. ESHITA V. SHAH</div>
        <div style="text-align: left; width: 100%; margin-left: 28px;">
          <p style="margin: 1px 0; font-size: 10px;">M.D (Pulmonary Medicine)</p>
          <p style="margin: 1px 0; font-size: 10px;">EDRM, FIP</p>
          <p style="margin: 1px 0; font-size: 10px;">Interventional Pulmonology</p>
          <p style="margin: 1px 0; font-size: 10px;">& Thoracic Oncology (New Delhi)</p>
        </div>
      </div>
      <div style="flex: 1; margin-right: -15px; display: flex; flex-direction: column; align-items: center; min-width: 165px;">
        <div style="font-weight: 800; font-size: 12px; letter-spacing: 1px; text-align: center; margin-right: -13px;">DR. VIPUL SHAH</div>
        <div style="text-align: right; width: 100%; margin-right: 50px;">
          <p style="margin: 1px 0; font-size: 10px;">MBSACI, DAAI (USA), PHD (Allergy)</p>
          <p style="margin: 1px 0; font-size: 10px;">Specialist in Allergy & Asthma</p>
          <p style="margin: 1px 0; font-size: 10px;">Tel : 0261-2464747</p>
          <p style="margin: 1px 0; font-size: 10px;">Mo. 9824124747</p>
        </div>
      </div>
      <div style="flex: 0 0 auto;">
        <img src="/image_half.png" height="80px" width="90px" alt="Chest Logo" style="margin-right: -4px; margin-top: 5px;" />
      </div>
    </div>
    <div style="height: 2px; background-color: #8B0000; margin: 4px 0;"></div>
    <div style="text-align: right; font-size: 12px; padding: 0 12px; margin-bottom: 4px;"><strong>${dateLabel}</strong> ${dateValue}</div>
    <!-- BODY -->
    <div style="flex-grow: 1; padding: 0 16px; margin-bottom: 40px;">
      <section style="margin-bottom: 10px; font-size: 12px; position: relative;">
        <p style="margin: 2px 0;"><strong>Name:</strong> ${patientName}</p>
        <p style="margin: 2px 0;"><strong>Age/Sex:</strong> ${patientAge}/${patientSex}</p>
      </section>
      <section style="margin: 16px 0;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
          <thead>
            <tr style="font-size: 12px; background-color: rgb(126, 148, 171);">
              <th style="padding: 4px 6px; text-align: left; font-size: 12px;">Medicine</th>
              <th style="padding: 4px 6px; text-align: center; font-size: 12px;">Dosage</th>
              <th style="padding: 4px 6px; text-align: center; font-size: 12px;">${timingColumnHeader}</th>
              <th style="padding: 4px 6px; text-align: center; font-size: 12px;">Duration</th>
              <th style="padding: 4px 6px; text-align: center; font-size: 11px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${translatedMedicines.map((m, i) => `
            <tr style="font-size: 11px; border-bottom: 1px solid black;">
              <td style="padding: 4px 6px;">${m.medicineName}</td>
              <td style="padding: 4px 6px; text-align: center;">${m.dosage}</td>
              <td style="padding: 4px 6px; text-align: center;">${!m.isBelow && m.rawInstructions?.other && m.rawInstructions.other.trim() !== '' ? escapeHtml(m.rawInstructions.other) : getTimingPatternLocalized(m.timings)}</td>
              <td style="padding: 4px 6px; text-align: center;">${m.duration} ${daysLabel}</td>
              <td style="padding: 4px 6px; text-align: center;">${m.quantity ? d(m.quantity.toString()) : d(calculateQty(m.dosageRaw || m.dosage, m.timings, m.durationRaw || m.duration))}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
      <section style="font-size: 10px; margin-bottom: 8px;">
        ${prescription.additionalNotes ? `<p><strong>Advice:</strong> ${prescription.additionalNotes}</p>` : ''}
        ${prescription.tests ? `<p><strong>Tests:</strong> ${prescription.tests}</p>` : ''}
        ${otherInstructions.length > 0 ? `
          <div style="margin-top: 6px; margin-bottom: 8px;">
            <strong>Other Instructions:</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0;">
              ${otherInstructions.map(instr => `<li>${escapeHtml(instr)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <p><strong>${nextVisitLabel} ${d(prescription.followUp.duration)} ${followUpUnitLabel}</strong></p>
      </section>
      <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; margin-top: 60%;">
        <p style="margin: 2px 0 0; font-size: 10px;">${doctorName}</p>
      </div>
    </div>
    <div style="height: 40px;"></div>
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; color: #374151;">
      <div style="font-weight: 500; font-size: 10px; background-color: white; padding: 5px 24px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span style="display: inline-flex; align-items: center; margin-right: 8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><rect x="2" y="4" width="20" height="16" fill="#888"/><polyline points="2,4 12,14 22,4" style="fill:none;stroke:#fff;stroke-width:2"/></svg>
          <span>respicure@dreshitashah.com</span>
        </span>
        <span style="display: inline-flex; align-items: center;">
          <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5" fill="none"/><path d="M12 2c2.5 2.5 2.5 15.5 0 18M12 2C9.5 4.5 9.5 17.5 12 20M4 12h16" stroke="#888" stroke-width="1.5" fill="none"/></svg>
          <span>www.dreshitashah.com</span>
        </span>
      </div>
      <footer style="background-color: #D8BFD8; padding: 10px 0; text-align: center; width: calc(100% + 48px); position: relative; left: -24px; box-sizing: border-box;">
        <p style="font-weight: 500; font-size: 10px; margin: 0; line-height: 1.4;">
          FOR APPOINTMENT: +91 93166 33039<br/>
          102, RESPICURE CHEST CLINIC, VISHWAKARMA CHAMBERS, MAJURAGATE, SURAT - 395002
        </p>
      </footer>
    </div>
  </div>
    `;
}

    async function generateSmallWithoutLetterhead({ prescription, patient, lang, width, height }) {
        // Like A4WithLetterhead but with small paper size and smaller header
        const t = async (text) => lang === 'english' ? text : await translateText(text, lang);
        const d = (val) => localizeDigits(val, lang);
        const patientName = patient?.basicInfo?.name || '';
        const patientAge = patient?.basicInfo?.age || '';
        const patientSex = patient?.basicInfo?.sex || '';
        const patientContact = patient?.basicInfo?.tel1 || (patient?.basicInfo?.tel2 || '');
        const patientRefBy = patient?.basicInfo?.refBy || '';
        const translatedMedicines = await Promise.all(prescription.medicines.map(async (m) => ({
            ...m,
            medicineName: m.medicineName,
            dosage: d(m.dosage),
            dosageRaw: m.dosage,
            duration: d(m.duration.toString()),
            durationRaw: m.duration,
            instructionsText: lang === 'english'
                ? formatInstructions(m.instructions, false)
                : await translateText(formatInstructions(m.instructions, false), lang),
            rawInstructions: m.instructions,
            isBelow: m.isBelow,
            timings: m.timings
        })));
        const timingMap = {
            morning: await t('Morning'),
            afternoon: await t('Afternoon'),
            evening: await t('Evening'),
            night: await t('Night'),
        };
        const noneLabel = lang === 'english' ? 'None' : await t('None');
        const getTimingPatternLocalized = (timings) => {
            const order = ['morning', 'afternoon', 'evening', 'night'];
            return order.filter(key => timings[key]).map(key => timingMap[key]).join('-') || noneLabel;
        };
        const daysLabel = await t('days');
        const hasCustomInstruction = prescription.medicines.some(m => !m.isBelow && m.instructions && m.instructions.other && m.instructions.other.trim());
        const timingColumnHeader = await t(hasCustomInstruction ? 'Instruction' : 'Timing');
        const nextVisitLabel = await t('Next Visit in ');
        const followUpUnitLabel = await t(prescription.followUp.unit);
        let dateLabel = 'Date:';
        let dateValue = new Date(prescription.prescriptionDate).toLocaleDateString();
        const otherInstructions = translatedMedicines
            .filter(m => m.isBelow && m.instructionsText)
            .map(m => `${m.medicineName}: ${m.instructionsText}`);
        if (prescription.commonBelowInstruction && prescription.commonBelowInstruction.trim()) {
            const translatedCommon = lang === 'english'
                ? prescription.commonBelowInstruction.trim()
                : await translateText(prescription.commonBelowInstruction.trim(), lang);
            otherInstructions.push(translatedCommon);
        }
        const doctorName = prescription.selectedDoctor || 'DR. VIPUL SHAH';
        return `
          <div id="prescription-content" style="width: ${width}; height: ${height}; display: flex; flex-direction: column; justify-content: space-between; padding: 16px; font-family: 'Montserrat', sans-serif; box-sizing: border-box; background: white; color: #374151; position: relative; margin: 0;">
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: -10px; margin-bottom: 0px; min-height: 90px;">
              <div style="flex: 0 0 auto;">
                <img src="" height="80px" width="90px"  style="margin-left: -4px;" />
              </div>
              <div style="flex: 1; margin-top: 0; display: flex; flex-direction: column; align-items: center; min-width: 100px;">
                <div style="font-weight: 800; font-size: 12px; letter-spacing: 1px; text-align: center; margin-left: -5px"></div>
                <div style="text-align: left; width: 100%; margin-left: 28px; ">
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                  <p style="margin: 1px 0; font-size: 10px;"> </p>
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                </div>
              </div>
              <div style="flex: 1; margin-right: -15px; margin-top: 0; display: flex; flex-direction: column; align-items: center; min-width: 165px;">
                <div style="font-weight: 800; font-size: 12px; letter-spacing: 1px; text-align: center; margin-right: -13px"></div>
                <div style="text-align: right; width: 100%; margin-right: 50px;">
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                  <p style="margin: 1px 0; font-size: 10px;"></p>
                </div>
              </div>
              <div style="flex: 0 0 auto;">
              </div>
            </div>
            <div style="height: 2px; background-color:rgb(255, 255, 255); margin-top: 3px; margin-bottom: 6px;"></div>
            <div style="text-align: right; font-size: 12px; margin-top: -3px; padding: 0 12px;"><strong>${dateLabel}</strong> ${dateValue}</div>
            <!-- BODY -->
            <div style="flex-grow: 1; padding: 0px 16px; margin-bottom: 40px;">
              <section style="margin-bottom: 10px; font-size: 12px; position: relative;">
                
                <p style="margin: 2px 0;"><strong>Name:</strong> ${patientName}</p>
                <p style="margin: 2px 0;"><strong>Age/Sex:</strong> ${patientAge}/${patientSex}</p>
                
              </section>
              <section style="margin-bottom: 16px; margin-top: 16px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                  <thead>
                    <tr style="font-size: 12px; background-color: rgb(126, 148, 171);">
                      <th style="padding: 4px 6px; text-align: left; font-size: 12px;">Medicine</th>
                      <th style="padding: 4px 6px; text-align: center; font-size: 12px;">Dosage</th>
                      <th style="padding: 4px 6px; text-align: center; font-size: 12px;">${timingColumnHeader}</th>
                      <th style="padding: 4px 6px; text-align: center; font-size: 12px;">Duration</th>
                      <th style="padding: 4px 6px; text-align: center; font-size: 11px;">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${translatedMedicines.map((m, i) => `
                    <tr style="font-size: 11px; border-bottom: 1px solid black;">
                      <td style="padding: 4px 6px;">${m.medicineName}</td>
                      <td style="padding: 4px 6px; text-align: center;">${m.dosage}</td>
                      <td style="padding: 4px 6px; text-align: center;">${!m.isBelow && m.rawInstructions?.other && m.rawInstructions.other.trim() !== '' ? escapeHtml(m.rawInstructions.other) : getTimingPatternLocalized(m.timings)}</td>
                      <td style="padding: 4px 6px; text-align: center;">${m.duration} ${daysLabel}</td>
                      <td style="padding: 4px 6px; text-align: center;">${m.quantity ? d(m.quantity.toString()) : d(calculateQty(m.dosageRaw || m.dosage, m.timings, m.durationRaw || m.duration))}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </section>
              <section style="font-size: 10px; margin-bottom: 8px;">
                ${prescription.additionalNotes ? `<p><strong>Advice:</strong> ${prescription.additionalNotes}</p>` : ''}
                ${prescription.tests ? `<p><strong>Tests:</strong> ${prescription.tests}</p>` : ''}
                ${otherInstructions.length > 0 ? `
                  <div style="margin-top: 6px; margin-bottom: 8px;">
                    <strong>Other Instructions:</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                      ${otherInstructions.map(instr => `<li>${escapeHtml(instr)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <p><strong>${nextVisitLabel} ${d(prescription.followUp.duration)} ${followUpUnitLabel}</strong></p>
              </section>
              <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; margin-top: 80%;">
                <p style="margin: 2px 0 0; font-size: 10px;">${doctorName}</p>
              </div>
            </div>
            <div style="height: 40px;"></div>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; color: #374151;">
              <div style="font-weight: 500; font-size: 10px; background-color: white; padding: 5px 24px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; margin-right: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><rect x="2" y="4" width="20" height="16" fill="#888"/><polyline points="2,4 12,14 22,4" style="fill:none;stroke:#fff;stroke-width:2"/></svg>
                  <span>respicure@dreshitashah.com</span>
                </span>
                <span style="display: inline-flex; align-items: center;">
                  <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5" fill="none"/><path d="M12 2c2.5 2.5 2.5 15.5 0 18M12 2C9.5 4.5 9.5 17.5 12 20M4 12h16" stroke="#888" stroke-width="1.5" fill="none"/></svg>
                  <span>www.dreshitashah.com</span>
                </span>
              </div>
              <footer style="background-color:rgb(255, 255, 255); padding: 10px 0; text-align: center; width: calc(100% + 48px); position: relative; left: -24px; box-sizing: border-box;">
                <p style="font-weight: 600; font-size: 11px; margin: 0;">
                </p>
              </footer>
            </div>
          </div>
        `;
    }

    const generatePDFContent = async (prescription, patient, lang = 'english', useOwnLetterhead = false, width = '210mm', height = '297mm', paperSize = 'A4') => {
        const args = { prescription, patient, lang, width, height };
        if (paperSize === 'A4' && !useOwnLetterhead) return await generateA4WithLetterhead(args);
        if (paperSize === 'A4' && useOwnLetterhead) return await generateA4WithoutLetterhead(args);
        if (paperSize === 'Small' && !useOwnLetterhead) return await generateSmallWithLetterhead(args);
        if (paperSize === 'Small' && useOwnLetterhead) return await generateSmallWithoutLetterhead(args);
        return await generateA4WithLetterhead(args);
    };

    const handleDownloadPDF = async (prescription, patient, lang = 'english') => {
        const paperSize = prescription?.paperSize || location.state?.paperSize || 'A4';
        const useOwnLetterhead = prescription?.useOwnLetterhead !== undefined ? prescription.useOwnLetterhead : (location.state?.useOwnLetterhead || false);
        const { width, height } = getPaperDimensions(paperSize);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = await generatePDFContent(prescription, patient, lang, useOwnLetterhead, width, height, paperSize);
        document.body.appendChild(tempDiv);

        try {
            const element = document.getElementById('prescription-content');
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794,
                windowHeight: 1123,
                x: 0,
                y: 0,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: paperSize === 'Small' ? 'a5' : 'a4',
                compress: true,
                precision: 16
            });

            const imgWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0.1) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`prescription-${patient.patientId}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    const handleViewPDF = async (prescription, patient, lang = 'english') => {
        const paperSize = prescription?.paperSize || location.state?.paperSize || 'A4';
        const useOwnLetterhead = prescription?.useOwnLetterhead !== undefined ? prescription.useOwnLetterhead : (location.state?.useOwnLetterhead || false);
        const { width, height } = getPaperDimensions(paperSize);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = await generatePDFContent(prescription, patient, lang, useOwnLetterhead, width, height, paperSize);
        document.body.appendChild(tempDiv);

        try {
            const element = document.getElementById('prescription-content');
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794,
                windowHeight: 1123,
                x: 0,
                y: 0,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: paperSize === 'Small' ? 'a5' : 'a4',
                compress: true,
                precision: 16
            });

            const imgWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0.1) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.output('dataurlnewwindow');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    // Before rendering prescriptions, sort them by createdAt (or _id timestamp if createdAt is not available)
    const sortedPrescriptions = [...prescriptions].sort((a, b) => {
        // Prefer createdAt if available, else fallback to _id timestamp
        const dateA = a.createdAt ? new Date(a.createdAt) : (a._id ? new Date(parseInt(a._id.substring(0,8), 16) * 1000) : new Date(0));
        const dateB = b.createdAt ? new Date(b.createdAt) : (b._id ? new Date(parseInt(b._id.substring(0,8), 16) * 1000) : new Date(0));
        return dateB - dateA;
    });

    // Helper to get timing labels
    const getTimingLabels = (timings) => {
        const labels = [];
        if (timings.morning) labels.push('Morning');
        if (timings.afternoon) labels.push('Afternoon');
        if (timings.evening) labels.push('Evening');
        if (timings.night) labels.push('Night');
        return labels.length ? labels.join(' - ') : 'None';
    };

    // Helper to calculate quantity based on dosage and timings
    const calculateQty = (dosage, timings, duration) => {
        if (!dosage || !timings || !duration) return '';
        // Dosage format: e.g., '1/2-0-0-1/2' or '1-0-0-1'
        const parts = dosage.split('-');
        const timingKeys = ['morning', 'afternoon', 'evening', 'night'];
        let dailyTotal = 0;
        for (let i = 0; i < timingKeys.length; i++) {
            if (timings[timingKeys[i]]) {
                // Parse as float, support fractions like 1/2
                let val = 0;
                if (parts[i]) {
                    if (parts[i].includes('/')) {
                        const [num, denom] = parts[i].split('/').map(Number);
                        val = denom ? num / denom : 0;
                    } else {
                        val = parseFloat(parts[i]) || 0;
                    }
                }
                dailyTotal += val;
            }
        }
        const qty = Math.round(dailyTotal * duration * 100) / 100;
        return isNaN(qty) ? 0 : qty; // round to 2 decimals, fallback to 0 if NaN
    };

    return (
        <div className="container py-4">
            {/* Add New Prescription Section */}
            <div className="card shadow-sm" style={{ borderRadius: 14 }}>
                <div className="card-header bg-white" style={{ borderRadius: '14px 14px 0 0', borderBottom: 'none', padding: '20px 24px 12px 24px' }}>
                    <span
                        className="fa fa-arrow-left me-3"
                        style={{ fontSize: 20, color: '#111', cursor: 'pointer' }}
                        onClick={() => navigate(`/patients/${patientId}`)}
                    ></span>
                    <span>
                        <h4 className="mb-0 fw-bold d-inline-block" style={{ fontSize: 22, color: '#222' }}>Prescriptions</h4>
                        <div className="text-primary fw-semibold mt-1" style={{ fontSize: 15 }}>
                            Patient ID: {patient && patient.patientId ? patient.patientId : patientId}
                        </div>
                    </span>
                </div>
                <div style={{ borderTop: '1.5px solid #e5e7eb', width: '100%' }} />
                <div className="card-body" style={{ background: '#fff', borderRadius: '0 0 14px 14px' }}>
                    <div
                        style={{
                            minHeight: 200,
                            border: '2px dashed rgb(209, 213, 219)',
                            borderRadius: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundColor: 'rgb(250, 250, 250)',
                            transition: '0.3s ease-in-out',
                            margin: '0 auto',
                            maxWidth: 700
                        }}
                        onClick={handleAddNewPrescription}
                    >
                        <div style={{ width: 64, height: 64, backgroundColor: 'rgb(229, 231, 235)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true" style={{ color: 'rgb(107, 114, 128)' }}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        </div>
                        <h6 className="fw-semibold text-dark mb-2">Add New Prescription</h6>
                        <p className="text-muted mb-0 text-center" style={{ maxWidth: 300 }}>Click here to add a new prescription for this patient</p>
                    </div>
                </div>
            </div>

            {/* Prescriptions History Section */}
            <div className="mt-4" style={{ background: '#f7f8fa', borderRadius: 16, padding: '32px 18px 24px 18px' }}>
                <h5 className="fw-bold mb-4" style={{ fontSize: 20, letterSpacing: 0.5 }}>Prescription History</h5>
                {prescriptions.length === 0 ? (
                    <div className="text-muted py-3">No prescriptions found for this patient.</div>
                ) : (
                    <div className="prescription-timeline">
                        {sortedPrescriptions.map((prescription, idx) => (
                            <div key={prescription._id} className="prescription-section mb-5 position-relative">
                                {/* Timeline vertical line */}
                                {idx !== sortedPrescriptions.length - 1 && (
                                    <div className="timeline-divider d-none d-md-block" style={{ position: 'absolute', left: 24, top: '100%', width: 2, height: 40, background: '#e0e7ef', zIndex: 0 }}></div>
                                )}
                                <div className="card shadow-sm prescription-history-card" style={{ transition: 'box-shadow 0.2s', borderRadius: 14, overflow: 'hidden' }}>
                                    <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2" style={{ borderBottom: '1.5px solid #e5e7eb' }}>
                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <span className="fw-bold text-secondary" style={{ fontSize: 16, letterSpacing: 0.2 }}>Prescription #{sortedPrescriptions.length - idx}</span>
                                            <span className="badge bg-primary text-light" style={{ fontSize: 14, padding: '8px 14px', borderRadius: 8 }}>
                                                <Calendar size={16} className="me-1" />
                                                {new Date(prescription.prescriptionDate).toLocaleDateString()}
                                            </span>
                                            <span className="badge bg-info text-dark" style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8 }}>
                                                Follow-up: {prescription.followUp.duration} {prescription.followUp.unit}
                                            </span>
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap align-items-center ms-md-auto mt-3 mt-md-0 prescription-btn-group">
                                            <button
                                                className="btn prescription-btn-edit"
                                                onClick={() => handleEdit(prescription)}
                                                title="Edit Prescription"
                                                aria-label="Edit Prescription"
                                            >
                                                <Edit2 size={16} className="me-1" /> Edit
                                            </button>
                                            <button
                                                className="btn prescription-btn-view"
                                                onClick={() => handleViewPDF(prescription, patient, prescription.printLanguage || 'english')}
                                                title="View as PDF"
                                                aria-label="View as PDF"
                                            >
                                                <Eye size={16} className="me-1" /> View
                                            </button>
                                            <button
                                                className="btn prescription-btn-download"
                                                onClick={() => handleDownloadPDF(prescription, patient, prescription.printLanguage || 'english')}
                                                title="Download PDF"
                                                aria-label="Download PDF"
                                            >
                                                <Download size={16} className="me-1" /> Download
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body" style={{ background: '#f9fafb', padding: '24px 18px' }}>
                                        <div className="mb-3">
                                            <h6 className="fw-semibold mb-2" style={{ fontSize: 16 }}>Medicines</h6>
                                            <div className="table-responsive" style={{ background: '#f3f6fa', borderRadius: 10, padding: 12 }}>
                                                <table className="table table-sm mb-0" style={{ fontSize: 14 }}>
                                                    <thead>
                                                        <tr style={{ background: '#e5e7eb' }}>
                                                            <th style={{ minWidth: 120, verticalAlign: 'top' }}>Medicine</th>
                                                            <th style={{ verticalAlign: 'top' }}>Dosage</th>
                                                            <th style={{ verticalAlign: 'top' }}>Timing</th>
                                                            <th style={{ verticalAlign: 'top' }}>Duration</th>
                                                            <th style={{ verticalAlign: 'top' }}>Qty</th>
                                                            <th style={{ minWidth: 180, maxWidth: 260, verticalAlign: 'top' }}>Instructions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {prescription.medicines.map((medicine, index) => {
                                                            const timingPattern = getTimingPattern(medicine.timings);
                                                            const freq = medicine.frequency || 'Daily';
                                                            const qty = (medicine.quantity !== undefined && medicine.quantity !== '') ? medicine.quantity : calculateQty(medicine.dosageRaw || medicine.dosage, medicine.timings, medicine.durationRaw || medicine.duration);
                                                            const instructionsText = formatInstructions(medicine.instructions);
                                                            return (
                                                                <tr key={index} style={{ verticalAlign: 'top' }}>
                                                                    <td className="fw-semibold text-primary" style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }}>
                                                                        <Pill size={15} className="me-1 text-primary" />
                                                                        {medicine.medicineName}
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }}>{medicine.dosage}</td>
                                                                    <td style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }}>
                                                                        <Clock size={13} className="me-1 text-info" />
                                                                        <span style={{fontWeight: 500, marginLeft: 8}}>{getTimingLabels(medicine.timings)}</span>
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }}>{medicine.duration} days</td>
                                                                    <td style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }}>{qty}</td>
                                                                    <td style={{ verticalAlign: 'top', paddingTop: 12, paddingBottom: 12, maxWidth: 260, minWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={instructionsText}>
                                                                        <File size={13} className="me-1 text-secondary" />
                                                                        <span className="text-muted small">{instructionsText}</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {prescription.additionalNotes && (
                                            <div className="mt-3">
                                                <h6 className="mb-2">Additional Notes</h6>
                                                <p className="text-muted mb-0">
                                                    {prescription.additionalNotes}
                                                </p>
                                            </div>
                                        )}
                                        {prescription.doctorRemarks && (
                                            <div className="mt-3">
                                                <h6 className="mb-2">Doctor's Remarks</h6>
                                                <p className="text-muted mb-0">
                                                    {prescription.doctorRemarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="text-center text-muted mt-4" style={{ fontSize: 13, letterSpacing: 0.2 }}>
                            Showing latest prescriptions
                        </div>
                    </div>
                )}
                <style>{`
                    .prescription-history-card:hover {
                        box-shadow: 0 6px 24px rgba(37,99,235,0.10);
                    }
                    .prescription-timeline {
                        position: relative;
                        padding-left: 0;
                    }
                    .prescription-section:before {
                        content: '';
                        display: block;
                        position: absolute;
                        left: 24px;
                        top: 0;
                        width: 12px;
                        height: 12px;
                        background: #2563eb;
                        border-radius: 50%;
                        z-index: 1;
                        border: 2px solid #fff;
                        box-shadow: 0 0 0 2px #e0e7ef;
                    }
                    .prescription-btn-group .btn {
                        min-width: 110px;
                        font-weight: 500;
                        border-radius: 8px;
                        border: none;
                        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
                        box-shadow: 0 1px 2px rgba(37,99,235,0.08);
                        margin-right: 4px;
                    }
                    .prescription-btn-edit {
                        background: #e0e7ff;
                        color: #3730a3;
                    }
                    .prescription-btn-edit:hover {
                        background: #c7d2fe;
                        color: #1e3a8a;
                    }
                    .prescription-btn-view {
                        background: #cffafe;
                        color: #155e75;
                    }
                    .prescription-btn-view:hover {
                        background: #a5f3fc;
                        color: #0e7490;
                    }
                    .prescription-btn-download {
                        background: #dcfce7;
                        color: #166534;
                    }
                    .prescription-btn-download:hover {
                        background: #bbf7d0;
                        color: #14532d;
                    }
                `}</style>
            </div>

            {showEditModal && (
                <Prescription
                    initialPatient={patient}
                    onClose={handleCloseModal}
                    prescriptionToEdit={selectedPrescription}
                />
            )}
        </div>
    );
}

export default PatientPrescriptions;