module.exports = ({ email, name }) => {
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    to: email,
    subject: `${name} employment contract details approved`,
    // html: "",
    text: `Employment Contract for ${name} has been approved successfully`,

    html(data) {
      return `
		<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            line-height: 20px;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="
            color: #626262;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            ">
                <h2 class="text-center" style="
               color: #626262;
               font-family: 'Paytone One',
               'Montserrat ', sans-serif;
               font-size: 30px;
               font-weight: 700;
               line-height: 1.3;
               margin: auto;
               padding: 0;
               text-align: center;
               width: 90%;
               word-wrap: normal;
               ">
                    Dear ${name},
                </h2>
                <h2 class="text-center" style="
               color: #626262;
               font-family: 'Paytone One',
               'Montserrat ', sans-serif;
               font-size: 30px;
               font-weight: 700;
               line-height: 1.3;
               margin: auto;
               padding: 0;
               text-align: center;
               width: 90%;
               word-wrap: normal;
               ">
                    Congratulations, your contract has been
                    approved
                </h2>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            color: #626262;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="margin: 0; padding: 0">
                <p class="text-center" style="
               color: #626262;
               font-family: Montserrat, sans-serif;
               font-size: 14px;
               font-weight: 300;
               line-height: 1.3;
               margin: auto;
               margin-bottom: 0px;
               padding: 0;
               text-align: center;
               width: 90%;
               ">
                    We are pleased to inform you that
                    YFTChain has approved your contract
                    information and you will be identified
                    as a verified professional player.
                </p>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="10" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="margin: 0; padding: 0">
                <p class="text-center" style="
               color: #626262;
               font-family: Montserrat, sans-serif;
               font-size: 14px;
               font-weight: 300;
               line-height: 1.3;
               margin: auto;
               margin-bottom: 0px;
               padding: 0;
               text-align: center;
               width: 90%;
               ">
                    Your verified professional status will
                    be showcased with a
                    <span style="
                  font-family: 'Montserrat',
                  sans-serif;
                  font-weight: 400;
                  display: block;
                  color: #626262;
                  ">green tick on the YFTChain
                        portal.</span>
                </p>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="margin: 0; padding: 0">
                <p class="text-center" style="
               color: #626262;
               font-family: Montserrat, sans-serif;
               font-size: 14px;
               font-weight: 300;
               line-height: 1.3;
               margin: auto;
               margin-bottom: 0px;
               padding: 0;
               text-align: center;
               width: 90%;
               ">
                    Please click below to go to YFTChain
                    portal and witness your new status.
                </p>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table class="button large float-center radius" align="center" width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   float: none;
   margin: 0;
   text-align: center;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            margin: 0;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            ">
                <table align="center" style="
               border-collapse: collapse;
               border-spacing: 0;
               padding: 0;
               vertical-align: top;
               ">
                    <tbody>
                        <tr style="
                     padding: 0;
                     vertical-align: top;
                     ">
                            <td style="
                        -moz-hyphens: auto;
                        -webkit-hyphens: auto;
                        border: none;
                        border-collapse: collapse !important;
                        margin: 0;
                        padding: 0;
                        vertical-align: top;
                        word-wrap: break-word;
                        ">
                                <a href="${data.appUrl}member/profile" target="_blank" style="
                           color: #fff;
                           cursor: pointer;
                           display: inline-block;
                           font-family: Montserrat,
                           sans-serif;
                           font-size: 16px;
                           font-weight: 300;
                           line-height: 1.3;
                           margin: 0;
                           padding: 15px 35px 15px 35px;
                           text-decoration: none;
                           border: none;
                           background: #f93;
                           border-radius: 10px;
                           ">
                                    Go to my profile
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>	
	  `;
    },
  };
};
