/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${RAFF Assesment}:${Create a page to display the details of universities using data from hipolabs.com.}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 10-May-2024
 *
 * Created by :Gopinath M , Jobin and Jismi IT Services.
 *
 * Description : Create a page to display the details of universities using data from hipolabs.com.
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
define(['N/ui/serverWidget', 'N/http'], function (serverWidget, http) {

    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        if (request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'University List'
            });

            var countryField = form.addField({
                id: 'custpage_jj_country',
                type: serverWidget.FieldType.SELECT,
                label: 'Country'
            });
            countryField.addSelectOption({ value: '', text: '' }); // Add an empty option as the first option
            countryField.addSelectOption({ value: 'India', text: 'India' });
            countryField.addSelectOption({ value: 'China', text: 'China' });
            countryField.addSelectOption({ value: 'Japan', text: 'Japan' });
            countryField.isMandatory = true;

            form.addSubmitButton({
                label: 'Submit'
            });

            // The sublist should be defined here but not populated yet
            var sublist = form.addSublist({
                id: 'custpage_jj_university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'University Details'
            });
            sublist.addField({
                id: 'custpage_jj_country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'custpage_jj_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'custpage_jj_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'custpage_jj_webpage',
                type: serverWidget.FieldType.URL,
                label: 'Web Pages'
            });

            response.writePage(form);
        } else {
            var country = request.parameters.custpage_jj_country;
            var url = 'http://universities.hipolabs.com/search?country=' + (country);
            var httpResponse = http.get({
                url: url
            });
            var universities = JSON.parse(httpResponse.body);

            var form = serverWidget.createForm({
                title: 'University List'
            });

            // Re-create the country field and set the selected value
            var countryField = form.addField({
                id: 'custpage_jj_country',
                type: serverWidget.FieldType.SELECT,
                label: 'Country'
            });
            countryField.addSelectOption({ value: '', text: '' });
            countryField.addSelectOption({ value: 'India', text: 'India', isSelected: country === 'India' });
            countryField.addSelectOption({ value: 'China', text: 'China', isSelected: country === 'China' });
            countryField.addSelectOption({ value: 'Japan', text: 'Japan', isSelected: country === 'Japan' });
            countryField.isMandatory = true;

            form.addSubmitButton({
                label: 'Submit'
            });

            // Re-create the sublist
            var sublist = form.addSublist({
                id: 'custpage_jj_university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'University Details'
            });
            sublist.addField({
                id: 'custpage_jj_country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'custpage_jj_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'custpage_jj_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'custpage_jj_webpage',
                type: serverWidget.FieldType.URL,
                label: 'Web Pages'
            });

            // Populate the sublist with the search results
            universities.forEach(function (university, index) {
                log.debug({
                    title: 'Setting sublist values',
                    details: 'Line: ' + index + ', Country: ' + university.country + ', Name: ' + university.name + ', State/Province: ' + university['state-province'] + ', Web Page: ' + university.web_pages[0]
                });
                sublist.setSublistValue({
                    id: 'custpage_jj_country',
                    line: index,
                    value: university.country || '' 
                });
                sublist.setSublistValue({
                    id: 'custpage_jj_name',
                    line: index,
                    value: university.name || '' 
                });
                sublist.setSublistValue({
                    id: 'custpage_jj_state',
                    line: index,
                    value: university['state-province']
                });

                sublist.setSublistValue({
                    id: 'custpage_jj_webpage',
                    line: index,
                    value: (university.web_pages && university.web_pages[0]) || '' // Check if web_pages exists and is not empty
                });
            });


            response.writePage(form);
        }
    }
    return {
        onRequest: onRequest
    };
});
