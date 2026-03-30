<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <testExecutions version="1">
      <xsl:apply-templates select="//testsuite"/>
    </testExecutions>
  </xsl:template>

  <xsl:template match="testsuite">
    <file path="{@name}">
      <xsl:apply-templates select="testcase"/>
    </file>
  </xsl:template>

  <xsl:template match="testcase">
    <!-- Convert seconds to milliseconds, round to integer -->
    <xsl:variable name="ms" select="round(@time * 1000)"/>
    <xsl:choose>
      <xsl:when test="skipped">
        <testCase name="{@name}" duration="{$ms}">
          <skipped message="{skipped/@message}"/>
        </testCase>
      </xsl:when>
      <xsl:when test="failure">
        <testCase name="{@name}" duration="{$ms}">
          <failure message="{failure/@message}">
            <xsl:value-of select="failure"/>
          </failure>
        </testCase>
      </xsl:when>
      <xsl:when test="error">
        <testCase name="{@name}" duration="{$ms}">
          <failure message="{error/@message}">
            <xsl:value-of select="error"/>
          </failure>
        </testCase>
      </xsl:when>
      <xsl:otherwise>
        <testCase name="{@name}" duration="{$ms}"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>