/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/currentRecord', 'N/error', 'N/record', 'N/search', 'N/format'],
    (serverWidget, currentRecord, error, record, search, format) => {
        /**
         * Function to get search filters based on selected values in the custom filter.
         * @param {string} subsidiary - Subsidiary ID
         * @param {string} customer - Customer ID
         * @param {string} status - Status
         * @param {string} department - Department ID
         * @returns {Array} - Array of search filters
         */
        const getFilters = (subsidiary, customer, status, department) => {
            try {
                // Create filters and add them to the search filters.
                const filters = [
                    ['status', 'anyof', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F'],
                    'AND',
                    ['taxline', 'is', 'F'],
                    'AND',
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['closed', 'is', 'F']
                ];
                log.debug('filters', filters)

                if (subsidiary) {
                    filters.push('AND', ['subsidiary', 'is', subsidiary]);
                }

                if (customer) {
                    filters.push('AND', ['entity', 'is', customer]);
                }

                if (status) {
                    filters.push('AND', ['status', 'is', status]);
                }

                if (department) {
                    filters.push('AND', ['department', 'is', department]);
                }

                return filters;
            } catch (e) {
                // Log any errors that occur during execution
                log.error({
                    title: 'Suitelet Error',
                    details: e.message
                });
            }
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                //Creating custom form and adding fields & sublists.
                let form = serverWidget.createForm({
                    title: 'Sales Orders For Fulfill and  Billed.'
                });
                form.clientScriptFileId = 2612;
                form.addFieldGroup({
                    id: 'filters',
                    label: 'Filters'
                });
                let status = form.addField({
                    id: 'status',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Status',
                    container: 'filters'
                });
                log.debug('status', status)
                status.addSelectOption({
                    value: '',
                    text: ''
                });
                status.addSelectOption({
                    value: 'SalesOrd:B',
                    text: 'Pending Fulfillment'
                });
                status.addSelectOption({
                    value: 'SalesOrd:D',
                    text: 'Partially Fulfilled'
                });
                status.addSelectOption({
                    value: 'SalesOrd:E',
                    text: ' Pending Billing/Partially Fulfilled'
                });
                status.addSelectOption({
                    value: 'SalesOrd:F',
                    text: 'Pending Billing'
                });
                status.defaultValue = scriptContext.request.parameters.clientScriptStatus;
                let customer = form.addField({
                    id: 'customername',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer',
                    container: 'filters',
                    source: 'customer'
                });

                customer.defaultValue = scriptContext.request.parameters.clientScriptCustomer;
                let subsidiary = form.addField({
                    id: 'subsidiaryname',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Subsidiary',
                    container: 'filters',
                    source: 'subsidiary'
                });

                subsidiary.defaultValue = scriptContext.request.parameters.clientScriptSubsidiary
                let department = form.addField({
                    id: 'departmentname',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Department',
                    container: 'filters',
                    source: 'department'
                });

                department.defaultValue = scriptContext.request.parameters.clientScriptDepartment;

                form.addSubtab({
                    id: 'result',
                    label: 'Search Result'
                });
                let sublist = form.addSublist({
                    id: 'searchresult',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'Search Result',
                    tab: 'result'
                });
                sublist.addField({
                    id: 'sublistinternalid',
                    label: 'Internal ID',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistdocumentname',
                    label: 'Document Name',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistdate',
                    label: 'Date',
                    type: serverWidget.FieldType.DATE
                });
                sublist.addField({
                    id: 'subliststatus',
                    label: 'Status',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistcustomername',
                    label: 'Customer',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistsubsidiary',
                    label: 'Subsidiary',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistdepartment',
                    label: 'Department',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistclass',
                    label: 'Class',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistline',
                    label: 'Line Number',
                    type: serverWidget.FieldType.TEXT
                });
                sublist.addField({
                    id: 'sublistsubtotal',
                    label: 'Subtotal',
                    type: serverWidget.FieldType.FLOAT
                });
                sublist.addField({
                    id: 'sublisttax',
                    label: 'Tax',
                    type: serverWidget.FieldType.FLOAT
                });
                sublist.addField({
                    id: 'sublisttotal',
                    label: 'Total',
                    type: serverWidget.FieldType.FLOAT
                });

                //Search to find Sales Orders to be fulfilled & billed.
                let createSavedSearch = search.create({
                    title: 'Sales order search',
                    id: 'customsearch238',
                    type: search.Type.SALES_ORDER,
                    columns: ['entity', 'trandate', 'subsidiary', 'department', 'total', 'tranid', 'status', 'class', 'line'],
                    //adding custom filters to the search
                    filters: getFilters(subsidiary.defaultValue, customer.defaultValue, status.defaultValue, department.defaultValue)

                });
                log.debug('createSavedSearch', createSavedSearch)

                //iterate through search results and adding values to the sublist fields.
                let searchRun = createSavedSearch.run();
                let result = searchRun.getRange({
                    start: 0,
                    end: 1000
                });
                let lineCount = 0;
                for (let i = 0; i < result.length; i++) {
                    let customerId = result[i].getValue('entity');
                    let isInactive = search.lookupFields({
                        type: search.Type.CUSTOMER,
                        id: customerId,
                        columns: ['isinactive']
                    }).isinactive;
                    if (!isInactive) {

                        let resultCustomer = result[i].getText('entity');
                        if (resultCustomer) {
                            sublist.setSublistValue({
                                id: 'sublistcustomername',
                                line: lineCount,
                                value: resultCustomer
                            });
                        }
                        let resultDocName = result[i].getValue('tranid');
                        sublist.setSublistValue({
                            id: 'sublistdocumentname',
                            line: lineCount,
                            value: resultDocName
                        })

                        let resultDate = result[i].getValue('trandate');
                        sublist.setSublistValue({
                            id: 'sublistdate',
                            line: lineCount,
                            value: resultDate
                        });

                        let resultSubsidiay = result[i].getText('subsidiary');
                        if (resultSubsidiay) {
                            sublist.setSublistValue({
                                id: 'sublistsubsidiary',
                                line: lineCount,
                                value: resultSubsidiay
                            })
                        }

                        let resultDepartment = result[i].getText('department');
                        if (resultDepartment) {
                            sublist.setSublistValue({
                                id: 'sublistdepartment',
                                line: lineCount,
                                value: resultDepartment
                            });
                        }

                        let resultTotal = result[i].getValue('total');
                        sublist.setSublistValue({
                            id: 'sublisttotal',
                            line: lineCount,
                            value: resultTotal
                        });

                        let resultTax = result[i].getValue('taxtotal');
                        if (resultTax) {
                            resultTax = format.format({
                                value: resultTax,
                                type: format.Type.CURRENCY,
                            });

                            sublist.setSublistValue({
                                id: 'sublisttax',
                                line: lineCount,
                                value: resultTax
                            });
                        }

                        let resultSubTotal = resultTotal - resultTax;
                        sublist.setSublistValue({
                            id: 'sublistsubtotal',
                            line: lineCount,
                            value: resultSubTotal
                        });

                        let resultStatus = result[i].getText('status');
                        sublist.setSublistValue({
                            id: 'subliststatus',
                            line: lineCount,
                            value: resultStatus
                        });

                        let resultClass = result[i].getText('class');
                        if (resultClass) {
                            sublist.setSublistValue({
                                id: 'sublistclass',
                                line: lineCount,
                                value: resultClass
                            });
                        }

                        let resultLine = result[i].getValue('line');
                        if (resultLine) {
                            sublist.setSublistValue({
                                id: 'sublistline',
                                line: lineCount,
                                value: resultLine
                            });
                        }

                        let resultInernalId = result[i].id;
                        sublist.setSublistValue({
                            id: 'sublistinternalid',
                            line: lineCount,
                            value: resultInernalId
                        });
                        lineCount++;
                    }

                }
                scriptContext.response.writePage(form);
            } catch (e) {
                log.error({
                    title: 'Suitelet Error',
                    details: e.message
                });
            }
        }

        return { onRequest }
    });
