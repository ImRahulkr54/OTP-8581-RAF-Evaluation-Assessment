/**
 * @NApiVersion 2.1
 * 
 * @NScriptType Suitelet
 */

/************************************************************************************  
********* 
 * 
 * OTP-8581 : RAF Evaluation Assessment
 *
 *  
 ************************************************************************************
 **********
 *
 * Author : Jobin and Jismi IT Services
 * 
 * Date Created : 25-Jun-2025
 * 
 * Description : This script is defined to build a NetSuite Custom Page that integrates
 *               with the external product API from Dummy JSON. The custom page should
 *               provide a search interface to enter a product SKU and upon clicking a
 *               button, It should fetch the full product list and filter the product
 *               that matches the entered SKU. Also display the Product Details in the
 *               body of the suitelet & its reviews in a Structured Subtab. 
 * 
 * REVISION HISTORY
 * 
 * @version 1.0 25-Jun-2025 : Created the initial build by JJ0400
 * 
 * 
 *************************************************************************************
***********/

define(["N/https", "N/log", "N/record", "N/search", "N/ui/serverWidget"], /**
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
(https, log, record, search, serverWidget) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {

    if (scriptContext.request.method === "GET") {

      try {

        createCustomPage(scriptContext);

      } catch (error) {

        log.error("error", error.message);
      }

    } 
    
    else if (scriptContext.request.method === "POST") {

      try {

        let itemData = fetchProductData(scriptContext);

        var form1 = serverWidget.createForm({
          title: "Product Details",
        });

        form1.addField({
          id: "custpage_product_sku",
          type: serverWidget.FieldType.TEXT,
          label: "Product SKU",
        }).defaultValue = itemData.sku;

        form1.addSubmitButton({
          label: "Fetch Reviews",
        });

        let productsName = (form1.addField({
          id: "products_name",
          type: serverWidget.FieldType.TEXT,
          label: "Product Name",
        }).defaultValue = itemData.title);

        let productsCategory = (form1.addField({
          id: "products_category",
          type: serverWidget.FieldType.TEXT,
          label: "Product Category",
        }).defaultValue = itemData.category);

        let productsPrice = (form1.addField({
          id: "products_price",
          type: serverWidget.FieldType.CURRENCY,
          label: "Product Price",
        }).defaultValue = itemData.price);

        let productsDescription = (form1.addField({
          id: "products_description",
          type: serverWidget.FieldType.TEXTAREA,
          label: "Product Description",
        }).defaultValue = itemData.description);

        if (itemData.reviews.length === 0) {

          log.debug("message", "No reviews available for this Project");
        } 
        
        else {

          var reviewSublist = form1.addSublist({
            id: "product_review",
            type: serverWidget.SublistType.LIST,
            label: "Product Review",
          });

          reviewSublist.addField({
            id: "reviewer_name",
            type: serverWidget.FieldType.TEXT,
            label: "Reviewer Name",
          });

          reviewSublist.addField({
            id: "reviewer_rating",
            type: serverWidget.FieldType.TEXT,
            label: "Reviewer Rating",
          });

          reviewSublist.addField({
            id: "reviewer_comment",
            type: serverWidget.FieldType.TEXT,
            label: "Reviewer Comment",
          });

          reviewSublist.addField({
            id: "reviewer_date",
            type: serverWidget.FieldType.TEXT,
            label: "Review Date",
          });

          for (let i = 0; i < itemData.reviews.length; i++) {
            reviewSublist.setSublistValue({
              id: "reviewer_name",
              type: serverWidget.FieldType.TEXT,
              line: i,
              value: itemData.reviews[i].reviewerName,
            });

            reviewSublist.setSublistValue({
              id: "reviewer_rating",
              type: serverWidget.FieldType.TEXT,
              line: i,
              value: itemData.reviews[i].rating,
            });

            reviewSublist.setSublistValue({
              id: "reviewer_comment",
              type: serverWidget.FieldType.TEXT,
              line: i,
              value: itemData.reviews[i].comment,
            });

            reviewSublist.setSublistValue({
              id: "reviewer_date",
              type: serverWidget.FieldType.TEXT,
              line: i,
              value: itemData.reviews[i].date,
            });

          }

        }

        scriptContext.response.writePage({
          pageObject: form1,
        });

      } catch (error) {

        log.error("error", error.message);

      }

    }

  };

  /**
   * Defines the Suitelet script to create a custom page
   * @param {Object} scriptContext
   * @since 2015.2
   */

  function createCustomPage(scriptContext) {

    try {

      let form = serverWidget.createForm({
        title: "Product Data Fetch",
      });

      form.addField({
        id: "custpage_product_sku",
        type: serverWidget.FieldType.TEXT,
        label: "Product SKU",
      });

      form.addSubmitButton({
        label: "Fetch Reviews",
      });

      scriptContext.response.writePage({
        pageObject: form,
      });

    } catch (error) {
      log.error("error", error.message);
    }

  }

  /**
   * Defines the Suitelet script to fetch data from external API.
   * @param {Object} scriptContext
   * @returns {resultData}
   * @since 2015.2
   */

  function fetchProductData(scriptContext) {

    try {
        let response = https.get({
        url: "https://dummyjson.com/products",
        headers: "text/plain",
      });

      let resultData = JSON.parse(response.body);

      let skuArray = [];

      for (let i = 0; i < resultData.products.length; i++) {
        skuArray.push(resultData.products[i].sku);
      }

      let sku = scriptContext.request.parameters.custpage_product_sku;

      let skuStatus = skuArray.indexOf(sku);

      if (skuStatus === -1) {

        log.debug("message", "No Matches Found");

      }
      
      else {

        return resultData.products[skuStatus];

      }

    } catch (error) {

      log.error("error", error.message);

    }

  }

  return { onRequest };

});
